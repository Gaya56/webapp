import { cn } from "@/lib/shadcn";

const MessageBubble = ({
  // color = "flat",
  className = "",
  children
}) => {
  return (
    <div
      className={cn(
        "rounded-[15px] w-full",
        // color === 'primary' ? 'bg-primary-blue text-white' : 'bg-zinc-300',
        className
      )}
    >
      {children}
    </div>
  );
};

export default MessageBubble;
