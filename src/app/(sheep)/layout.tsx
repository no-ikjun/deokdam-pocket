import "./sheep.css";

export default function SheepLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="sheep-root">
      <main className="sheep-shell">{children}</main>
    </div>
  );
}
