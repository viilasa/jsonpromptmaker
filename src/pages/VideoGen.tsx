import VideoPromptBuilder from "@/components/VideoPromptBuilder";

const VideoGen = () => {
  return <VideoPromptBuilder onBack={() => window.history.back()} />;
};

export default VideoGen;
