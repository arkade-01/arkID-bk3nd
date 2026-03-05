import { Request, Response } from "express";
import { Card } from "../models/card";
import { uploadPfp } from "../services/uploadService";

// Helper function to generate sequential card IDs (ark000, ark001, ark002...)
export const generateCardId = async (): Promise<string> => {
  // Get the highest card_id number
  const lastCard = await Card.findOne()
    .sort({ card_id: -1 })
    .select("card_id")
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
  const cardId = `ark${nextNumber.toString().padStart(3, "0")}`;

  return cardId;
};

// Helper function to create a card (called from payment route after purchase)
export const createCardForUser = async (
  username: string,
  email?: string,
  card_id?: string,
) => {
  // Generate card_id if not provided
  const finalCardId = card_id || (await generateCardId());

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
    profile_views: 0,
  });

  await newCard.save();
  return newCard;
};

export const getCardByUsername = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { username } = req.params;

    const card = await Card.findOne({ username });

    if (!card) {
      res.status(404).json({
        success: false,
        message: "Card not found",
      });
      return;
    }

    // Increment taps_count and profile_views
    card.taps_count += 1;
    if (card.isActivated) {
      card.profile_views += 1;
    }

    await card.save();

    res.json({
      success: true,
      data: {
        username: card.username,
        isActivated: card.isActivated,
        display_name: card.display_name || null,
        bio: card.bio || null,
        profile_photo: card.profile_photo || null,
        social_links: card.isActivated
          ? card.social_links
              .filter((link: any) => link.visible)
              .sort((a: any, b: any) => a.order - b.order)
          : [],
        taps_count: card.taps_count,
      },
    });
  } catch (error) {
    console.error("Error fetching card:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch card",
    });
  }
};

export const activateCard = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { card_id } = req.body;
    const privyId = req.user?.userId; // Privy DID from auth

    if (!card_id) {
      res.status(400).json({
        success: false,
        message: "card_id is required",
      });
      return;
    }

    const card = await Card.findOne({ card_id });

    if (!card) {
      res.status(404).json({
        success: false,
        message: "Card not found",
      });
      return;
    }

    // Check if card is already activated
    if (card.isActivated) {
      res.status(400).json({
        success: false,
        message: "Card is already activated",
      });
      return;
    }

    // Activate the card and set privy_id
    card.isActivated = true;
    card.privy_id = privyId;
    await card.save(); // Pre-save hook will generate user_id

    res.json({
      success: true,
      message: "Card activated successfully",
      data: {
        card_id: card.card_id,
        user_id: card.user_id,
        username: card.username,
        isActivated: card.isActivated,
      },
    });
  } catch (error) {
    console.error("Error activating card:", error);
    res.status(500).json({
      success: false,
      message: "Failed to activate card",
    });
  }
};

export const updateCard = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { display_name, bio, social_links } = req.body;
    const userId = req.user?.userId;

    const card = await Card.findOne({ privy_id: userId });

    if (!card) {
      res.status(404).json({
        success: false,
        message: "Card not found for this user",
      });
      return;
    }

    if (bio && bio.length > 200) {
      res.status(400).json({
        success: false,
        message: "Bio must be 200 characters or less",
      });
      return;
    }

    if (display_name !== undefined) card.display_name = display_name;
    if (bio !== undefined) card.bio = bio;
    if (social_links !== undefined) {
      try {
        // Check if it's a string (from form-data) and parse it
        card.social_links =
          typeof social_links === "string"
            ? JSON.parse(social_links)
            : social_links;
      } catch (parseError) {
        res.status(400).json({
          success: false,
          message:
            "Invalid format for social_links. It must be a valid JSON array.",
        });
        return;
      }
    }

    if (req.file) {
      card.profile_photo = await uploadPfp(req.file);
    }

    await card.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        card_id: card.card_id,
        user_id: card.user_id,
        username: card.username,
        display_name: card.display_name,
        bio: card.bio,
        profile_photo: card.profile_photo,
        social_links: card.social_links,
        isActivated: card.isActivated,
      },
    });
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

export const getUserCards = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId; // This is Privy DID

    const cards = await Card.find({ privy_id: userId });

    // Filter out sensitive fields
    const filteredCards = cards.map((card) => ({
      card_id: card.card_id,
      user_id: card.user_id,
      username: card.username,
      email: card.email,
      wallet: card.wallet,
      isActivated: card.isActivated,
      display_name: card.display_name,
      bio: card.bio,
      profile_photo: card.profile_photo,
      social_links: card.social_links,
      taps_count: card.taps_count,
      profile_views: card.profile_views,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    }));

    res.json({
      success: true,
      data: filteredCards,
    });
  } catch (error) {
    console.error("Error fetching user cards:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user cards",
    });
  }
};

export const migrateCards = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Target ONLY cards that are currently activated, and set them to false
    const result = await Card.updateMany(
      { isActivated: true },
      { $set: { isActivated: false } },
    );

    res.json({
      success: true,
      message: "All activated cards have been set to false.",
      data: result, // Returns the stats: { matchedCount, modifiedCount, etc. }
    });
  } catch (error) {
    console.error("Error migrating cards:", error);
    res.status(500).json({
      success: false,
      message: "Failed to migrate cards",
    });
  }
};