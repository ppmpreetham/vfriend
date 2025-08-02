const MarkImportant: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <span className="px-2 bg-primary text-black rounded-2xl">{children}</span>
);

export default MarkImportant;
