export type WorkFormState = {
  status: "idle" | "success" | "error";
  message: string;
  debugMessage?: string;
};

export const initialWorkFormState: WorkFormState = {
  status: "idle",
  message: "",
  debugMessage: "",
};
