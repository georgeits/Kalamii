export type WorkFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialWorkFormState: WorkFormState = {
  status: "idle",
  message: "",
};
