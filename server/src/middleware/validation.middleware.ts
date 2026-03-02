import { Request, Response, NextFunction, RequestHandler } from "express";
import Joi from "joi"; // validation library

function validationMiddleware(Schema: Joi.Schema): RequestHandler {
    return async(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const validationOptions = {
            abortEarly: false, // on the first validation failure, it will stop the request
            allowUnknown: true,  // allows values that aren't part of the schema, won't fail
            stripUnknown: true, // strip unknown and gets rid of it
        }

        try {
            const value = await Schema.validateAsync(
                req.body,
                validationOptions
            )
            
            req.body = value;
            next();
        } catch (e: any) {
            const errors = e.details.map((error: Joi.ValidationErrorItem) => error.message);
            
            res.status(400).json({
                status: 400,
                message: errors.join(', ')
            });
        }
    }
}

export default validationMiddleware;