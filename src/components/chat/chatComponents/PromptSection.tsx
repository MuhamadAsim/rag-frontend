import PromptShortcuts from "@/components/chat/PromptShortcuts";

interface PromptSectionProps {
  onSelectPrompt: (prompt: string) => void;
  userId?: string;
}


const PromptSection = ({ onSelectPrompt, userId }: PromptSectionProps) => (
  <div className="border-t p-4 bg-surface/50">
    <PromptShortcuts onSelectPrompt={onSelectPrompt} compact userId={userId} />
  </div>
);

export default PromptSection;
