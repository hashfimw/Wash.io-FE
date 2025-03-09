import { UpdateLaundryJobInputBody } from "@/types/driverWorker";
import { Dispatch, SetStateAction } from "react";
import { z } from "zod";

interface ValidateSchema {
  inputBody: UpdateLaundryJobInputBody[];
  inputRef: UpdateLaundryJobInputBody[];
  setErrors: Dispatch<SetStateAction<string[]>>;
  orderItemNames: string[]
}

const orderItemSchema = z.object({
  orderItemId: z.number().int().positive(),
  qty: z.number().int().positive(),
});


const validateOrderItemInputs = ({ inputBody, inputRef, setErrors, orderItemNames }: ValidateSchema): boolean => {
  const newErrors: string[] = [];

  if (!inputRef || inputRef.length === 0) {
    newErrors.push("No fetched items available for validation");
    setErrors(newErrors);
    return false;
  }

  if (inputBody.length !== inputRef.length) {
    newErrors.push("Number of items doesn't match the fetched data");
    setErrors(newErrors);
    return false;
  }

  try {
    inputBody.forEach((item, idx) => {
      const result = orderItemSchema.safeParse(item);
      if (!result.success) {
        result.error.errors.forEach((err) => {
          newErrors.push(`Item ${orderItemNames[idx]}: ${err.path.join(".")} - ${err.message}`);
        });
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return false;
    }

    inputRef.forEach((fetchedItem, idx) => {
      const matchingInput = inputBody.find((input) => input.orderItemId === fetchedItem.orderItemId);

      if (!matchingInput) {
        newErrors.push(`Item ${orderItemNames[idx]} is missing`);
      } else {
        const exactMatchSchema = z.object({
          orderItemId: z.literal(fetchedItem.orderItemId),
          qty: z.literal(fetchedItem.qty),
        });

        const result = exactMatchSchema.safeParse(matchingInput);
        if (!result.success) {
          result.error.errors.forEach((err) => {
            if (err.path.includes("qty")) {
              newErrors.push(
                `Quantity for item ${orderItemNames[idx]} doesn't match. Expected: ${
                  fetchedItem.qty
                }, Got: ${matchingInput.qty}`
              );
            }
          });
        }
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      newErrors.push(`Validation error: ${error.message}`);
    } else {
      newErrors.push("Unknown validation error occurred");
    }
  }

  setErrors(newErrors);
  return newErrors.length === 0;
};

export default validateOrderItemInputs