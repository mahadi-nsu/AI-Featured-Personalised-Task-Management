import { CardProps } from "../types/testCaseTypes";

export const Card = ({ title, children }: CardProps) => (
  <div className="border rounded-lg p-6">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    {children}
  </div>
);
