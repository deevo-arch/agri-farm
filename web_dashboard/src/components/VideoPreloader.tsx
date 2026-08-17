import React from 'react';
import './VideoPreloader.css';

interface VideoPreloaderProps {
  message?: string;
  subtext?: string;
}

export const VideoPreloader: React.FC<VideoPreloaderProps> = ({
  message = 'Fetching Live API Data...',
  subtext = 'Synchronizing records with Agri Farm Central Database'
}) => {
  return (
    <div className="video-preloader-container">
      <video
        className="video-preloader-bg"
        src="/loading_preloader.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
    </div>
  );
};

export default VideoPreloader;
