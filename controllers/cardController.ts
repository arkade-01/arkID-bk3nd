import { Request, Response } from "express";
import { Card } from "../models/card";

// Helper function to generate sequential card IDs (ark000, ark001, ark002...)
export const generateCardId = async (): Promise<string> => {
  // Get the highest card_id number
  const lastCard = await Card.findOne()
    .sort({ card_id: -1 })
    .select('card_id')
    .lean();

  let nextNumber = 0;

  if (lastCard && lastCard.card_id) {
    // Extract number from card_id (e.g., "ark042" -> 42)
    const match = lastCard.card_id.match(/^ark(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  // Format with leading zeros (ark000, ark001, etc.)
  const cardId = `ark${nextNumber.toString().padStart(3, '0')}`;

  return cardId;
};

// Helper function to create a card (called from payment route after purchase)
export const createCardForUser = async (
  username: string,
  email?: string,
  card_id?: string
) => {
  // Generate card_id if not provided
  const finalCardId = card_id || await generateCardId();

  // Check if card_id already exists
  const existingCard = await Card.findOne({ card_id: finalCardId });
  if (existingCard) {
    throw new Error("Card with this card_id already exists");
  }

  // Check if username is already taken
  const existingUsername = await Card.findOne({ username });
  if (existingUsername) {
    throw new Error("Username is already taken");
  }

  // Create new card (without privy_id and user_id - set on activation)
  const newCard = new Card({
    card_id: finalCardId,
    username,
    email: email || undefined,
    isActivated: false,
    taps_count: 0,
    valid_redirects_count: 0
  });

  await newCard.save();
  return newCard;
};

export const getCardByUsername = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    const card = await Card.findOne({ username });

    if (!card) {
      res.status(404).json({
        success: false,
        message: "Card not found"
      });
      return;
    }

    // Increment taps_count
    card.taps_count += 1;

    // If card is activated and has redirect_url, increment valid_redirects_count
    if (card.isActivated && card.redirect_url) {
      card.valid_redirects_count += 1;
    }

    await card.save();

    res.json({
      success: true,
      data: {
        username: card.username,
        isActivated: card.isActivated,
        redirect_url: card.isActivated ? card.redirect_url : null,
        taps_count: card.taps_count
      }
    });
  } catch (error) {
    console.error("Error fetching card:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch card"
    });
  }
};

export const activateCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { card_id, redirect_url } = req.body;
    const privyId = req.user?.userId; // Privy DID from auth

    if (!card_id || !redirect_url) {
      res.status(400).json({
        success: false,
        message: "card_id and redirect_url are required"
      });
      return;
    }

    // Validate URL format
    try {
      new URL(redirect_url);
    } catch {
      res.status(400).json({
        success: false,
        message: "Invalid URL format"
      });
      return;
    }

    const card = await Card.findOne({ card_id });

    if (!card) {
      res.status(404).json({
        success: false,
        message: "Card not found"
      });
      return;
    }

    // Check if card is already activated
    if (card.isActivated) {
      res.status(400).json({
        success: false,
        message: "Card is already activated"
      });
      return;
    }

    // Activate the card and set privy_id
    card.isActivated = true;
    card.privy_id = privyId;
    card.redirect_url = redirect_url;
    await card.save(); // Pre-save hook will generate user_id

    res.json({
      success: true,
      message: "Card activated successfully",
      data: {
        card_id: card.card_id,
        user_id: card.user_id,
        username: card.username,
        redirect_url: card.redirect_url,
        isActivated: card.isActivated
      }
    });
  } catch (error) {
    console.error("Error activating card:", error);
    res.status(500).json({
      success: false,
      message: "Failed to activate card"
    });
  }
};

export const updateCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { redirect_url } = req.body;
    const userId = req.user?.userId;

    if (!redirect_url) {
      res.status(400).json({
        success: false,
        message: "redirect_url is required"
      });
      return;
    }

    // Validate URL format
    try {
      new URL(redirect_url);
    } catch {
      res.status(400).json({
        success: false,
        message: "Invalid URL format"
      });
      return;
    }

    const card = await Card.findOne({ privy_id: userId });

    if (!card) {
      res.status(404).json({
        success: false,
        message: "Card not found for this user"
      });
      return;
    }

    // Update redirect URL
    card.redirect_url = redirect_url;
    await card.save();

    res.json({
      success: true,
      message: "Card updated successfully",
      data: {
        card_id: card.card_id,
        user_id: card.user_id,
        username: card.username,
        redirect_url: card.redirect_url,
        isActivated: card.isActivated
      }
    });
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update card"
    });
  }
};

export const getUserCards = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId; // This is Privy DID

    const cards = await Card.find({ privy_id: userId });

    // Filter out sensitive fields
    const filteredCards = cards.map(card => ({
      card_id: card.card_id,
      user_id: card.user_id,
      username: card.username,
      email: card.email,
      wallet: card.wallet,
      isActivated: card.isActivated,
      redirect_url: card.redirect_url,
      taps_count: card.taps_count,
      valid_redirects_count: card.valid_redirects_count,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt
    }));

    res.json({
      success: true,
      data: filteredCards
    });
  } catch (error) {
    console.error("Error fetching user cards:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user cards"
    });
  }
};
