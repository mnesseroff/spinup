import React from 'react';
import { Palette, Music, Video, Sparkles } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8 text-center">About Spinner</h1>
      
      <div className="prose prose-invert mx-auto">
        <p className="text-lg text-white/80 mb-12 text-center">
          We create tools that empower artists to bring their creative visions to life.
          Our mission is to make professional-grade creative tools accessible to everyone.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/5 p-6 rounded-xl">
            <Palette className="w-8 h-8 mb-4 text-purple-400" />
            <h3 className="text-xl font-semibold mb-2">Visual Creation</h3>
            <p className="text-white/70">
              Transform your artwork into mesmerizing spinning visuals perfect for social media.
            </p>
          </div>

          <div className="bg-white/5 p-6 rounded-xl">
            <Music className="w-8 h-8 mb-4 text-blue-400" />
            <h3 className="text-xl font-semibold mb-2">Audio Integration</h3>
            <p className="text-white/70">
              Seamlessly combine your music with stunning visuals to create engaging content.
            </p>
          </div>

          <div className="bg-white/5 p-6 rounded-xl">
            <Video className="w-8 h-8 mb-4 text-green-400" />
            <h3 className="text-xl font-semibold mb-2">Video Export</h3>
            <p className="text-white/70">
              Export high-quality videos optimized for various social media platforms.
            </p>
          </div>

          <div className="bg-white/5 p-6 rounded-xl">
            <Sparkles className="w-8 h-8 mb-4 text-yellow-400" />
            <h3 className="text-xl font-semibold mb-2">Creative Freedom</h3>
            <p className="text-white/70">
              Customize every aspect of your creation with our intuitive tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;