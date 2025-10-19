import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

export type AspectRatio = '9x16' | '4x5' | '1x1';
export type SpinDirection = 'normal' | 'reverse';

interface VinylContextType {
  labelUrl: string | null;
  labelFileName: string | null;
  rpm: number;
  spinDirection: SpinDirection;
  selectedRatio: AspectRatio;
  labelSize: number;
  captureRotation: number;
  vinylRef: React.RefObject<HTMLDivElement>;
  handleLabelUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveLabel: () => void;
  setRpm: (rpm: number) => void;
  setLabelSize: (size: number) => void;
  setSpinDirection: (direction: SpinDirection) => void;
  setSelectedRatio: (ratio: AspectRatio) => void;
  setCaptureRotation: (rotation: number) => void;
}

const VinylContext = createContext<VinylContextType | null>(null);

export const VinylProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [labelUrl, setLabelUrl] = useState<string | null>(null);
  const [labelFileName, setLabelFileName] = useState<string | null>(null);
  const [rpm, setRpm] = useState(10);
  const [spinDirection, setSpinDirection] = useState<SpinDirection>('normal');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('9x16');
  const [labelSize, setLabelSize] = useState(50);
  const [captureRotation, setCaptureRotation] = useState(0);
  const vinylRef = useRef<HTMLDivElement>(null);

  // Adjust label size based on selected ratio
  useEffect(() => {
    const defaultSizes = {
      '9x16': 50,
      '4x5': 40,
      '1x1': 35
    };
    setLabelSize(defaultSizes[selectedRatio]);
  }, [selectedRatio]);

  const handleLabelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, GIF, or WEBP)');
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file is too large. Please upload an image smaller than 5MB.');
      return;
    }

    try {
      // Cleanup previous URL if exists
      if (labelUrl) {
        URL.revokeObjectURL(labelUrl);
      }
      
      const url = URL.createObjectURL(file);
      setLabelUrl(url);
      setLabelFileName(file.name);
    } catch (error) {
      console.error('Failed to load image:', error);
      alert('Failed to load image file. Please try again.');
    }
  };

  const handleRemoveLabel = () => {
    if (labelUrl) {
      URL.revokeObjectURL(labelUrl);
    }
    setLabelUrl(null);
    setLabelFileName(null);
  };

  useEffect(() => {
    return () => {
      // Cleanup resources when component unmounts
      if (labelUrl) {
        URL.revokeObjectURL(labelUrl);
      }
    };
  }, []);

  const value = {
    labelUrl,
    labelFileName,
    rpm,
    spinDirection,
    selectedRatio,
    labelSize,
    captureRotation,
    vinylRef,
    handleLabelUpload,
    handleRemoveLabel,
    setRpm,
    setLabelSize,
    setSpinDirection,
    setSelectedRatio,
    setCaptureRotation
  };

  return (
    <VinylContext.Provider value={value}>
      {children}
    </VinylContext.Provider>
  );
};

export const useVinylContext = () => {
  const context = useContext(VinylContext);
  if (!context) {
    throw new Error('useVinylContext must be used within a VinylProvider');
  }
  return context;
}; 