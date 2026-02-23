import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import {
  getCardByUsername,
  activateCard,
  updateCard,
  getUserCards
} from "../controllers/cardController";

const router = Router();

/**
 * @openapi
 * /card/{username}:
 *   get:
 *     tags:
 *       - Cards
 *     summary: Get card by username
 *     description: Public endpoint to fetch a card profile. Increments taps_count on every visit and profile_views if the card is activated.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The card's unique username
 *         example: john_doe
 *     responses:
 *       200:
 *         description: Card profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                     isActivated:
 *                       type: boolean
 *                     display_name:
 *                       type: string
 *                       nullable: true
 *                     bio:
 *                       type: string
 *                       nullable: true
 *                     profile_photo:
 *                       type: string
 *                       nullable: true
 *                     social_links:
 *                       type: array
 *                       items:
 *                         type: object
 *                     taps_count:
 *                       type: integer
 *       404:
 *         description: Card not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:username", getCardByUsername);

/**
 * @openapi
 * /card/activate:
 *   post:
 *     tags:
 *       - Cards
 *     summary: Activate a card
 *     description: Links a purchased card to the authenticated Privy user. Can only be called once per card.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - card_id
 *             properties:
 *               card_id:
 *                 type: string
 *                 example: ark001
 *                 description: The ID printed on the physical card
 *     responses:
 *       200:
 *         description: Card activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     card_id:
 *                       type: string
 *                     user_id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     isActivated:
 *                       type: boolean
 *       400:
 *         description: Missing card_id or card already activated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized – missing or invalid Privy token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Card not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/activate", authMiddleware, activateCard);

/**
 * @openapi
 * /card/update:
 *   patch:
 *     tags:
 *       - Cards
 *     summary: Update card profile
 *     description: Update the authenticated user's card profile (display name, bio, photo, social links).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               display_name:
 *                 type: string
 *                 example: John Doe
 *               bio:
 *                 type: string
 *                 maxLength: 200
 *                 example: Software engineer based in Lagos
 *               profile_photo:
 *                 type: string
 *                 example: https://example.com/photo.jpg
 *               social_links:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     platform:
 *                       type: string
 *                       example: twitter
 *                     url:
 *                       type: string
 *                       example: https://twitter.com/johndoe
 *                     visible:
 *                       type: boolean
 *                     order:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Card'
 *       400:
 *         description: Validation error (e.g. bio too long)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Card not found for this user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch("/update", authMiddleware, updateCard);

/**
 * @openapi
 * /card/user/cards:
 *   get:
 *     tags:
 *       - Cards
 *     summary: Get all cards for authenticated user
 *     description: Returns all cards associated with the authenticated Privy user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's cards
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Card'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/user/cards", authMiddleware, getUserCards);

export default router;
