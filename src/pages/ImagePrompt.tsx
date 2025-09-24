import { ImagePromptBuilder } from "@/components/ImagePromptBuilder";
import { useNavigate } from "react-router-dom";

const ImagePrompt = () => {
  const navigate = useNavigate();

  return <ImagePromptBuilder onBack={() => navigate(-1)} />;
};

export default ImagePrompt;
