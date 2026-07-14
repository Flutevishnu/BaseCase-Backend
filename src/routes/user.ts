import { Router } from "express";
import { validate } from "../middleware/validate.js";
import {
  createUserSchema,
  getUserParamsSchema,
  UserUpdateSchema,
  type CreateUserInput,
  type GetUserParams,
  type UpdateUserInput
} from "../schemas/request/user.js";
import {
  createUserResponseSchema,
  userIdResponseSchema,
  updateUserResponseSchema
} from "../schemas/response/user.js";
import * as userService from "../services/user.service.js";

export const userRouter = Router();

userRouter.post(
  "/",
  validate({ body: createUserSchema }),
  async (req, res, next) => {
    try {
      const result = await userService.createUser(
        req.validated.body as CreateUserInput,
      );

      if (!result.success) {
        res.status(409).json(createUserResponseSchema.parse(result));
        return;
      }

      res.status(201).json(createUserResponseSchema.parse(result));
    } catch (error) {
      next(error);
    }
  },
);

userRouter.patch(
  "/:clerkUserId",
  validate({ params: getUserParamsSchema, body: UserUpdateSchema }),
  async (req, res, next) => {
    try {
      const { clerkUserId } = req.validated.params as GetUserParams;
      const result = await userService.updateUser(clerkUserId, req.validated.body as UpdateUserInput);

      if (!result.success) {
        res.status(409).json(updateUserResponseSchema.parse(result));
        return;
      }

      res.status(200).json(updateUserResponseSchema.parse(result));
    }
    catch (error) {
      next(error);
    }
  }
)

userRouter.get(
  "/:clerkUserId",
  validate({ params: getUserParamsSchema }),
  async (req, res, next) => {
    try {
      const { clerkUserId } = req.validated.params as GetUserParams;
      const result = await userService.getUserIdByClerkId(clerkUserId);

      if (!result) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json(userIdResponseSchema.parse(result));
    } catch (error) {
      next(error);
    }
  },
);
