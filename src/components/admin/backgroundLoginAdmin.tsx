import React from "react";
import {
  Shirt,
  Droplets,
  Wind,
  WashingMachine,
  Wallet,
  ReceiptText,
  ClipboardList,
  Timer,
} from "lucide-react";

interface BackgroundIconsProps {
  opacity?: number;
}

const BackgroundIcons: React.FC<BackgroundIconsProps> = ({ opacity = 0.07 }) => {
  return (
    <div className="absolute inset-0 overflow-hidden z-0" style={{ opacity }}>
      {/* baris atas */}
      <div className="absolute top-[5%] left-[10%]">
        <WashingMachine size={90} className="text-birtu" />
      </div>
      <div className="absolute top-[5%] right-[10%]">
        <Droplets size={70} className="text-birtu animate-pulse" />
      </div>

      {/* baris tengah atas */}
      <div className="absolute top-[25%] left-[5%]">
        <Timer size={65} className="text-birtu" />
      </div>
      <div className="absolute top-[25%] left-1/4">
        <Droplets size={75} className="text-birtu" />
      </div>
      <div className="absolute top-[25%] right-1/4">
        <WashingMachine size={70} className="text-birtu" />
      </div>
      <div className="absolute top-[25%] right-[5%]">
        <Shirt size={80} className="text-birtu" />
      </div>

      {/* baris tengah */}
      <div className="absolute top-[45%] left-[15%]">
        <Wallet size={75} className="text-birtu" />
      </div>
      <div className="absolute top-[45%] left-[40%]">
        <ClipboardList size={90} className="text-birtu" />
      </div>
      <div className="absolute top-[45%] right-[40%]">
        <Shirt size={70} className="text-birtu" />
      </div>
      <div className="absolute top-[45%] right-[15%]">
        <Wind size={65} className="text-birtu" />
      </div>

      {/* baris tengah bawah */}
      <div className="absolute top-[65%] left-[8%]">
        <Shirt size={65} className="text-birtu" />
      </div>
      <div className="absolute top-[65%] left-1/3">
        <WashingMachine size={80} className="text-birtu" />
      </div>
      <div className="absolute top-[65%] right-1/3">
        <Wallet size={60} className="text-birtu" />
      </div>
      <div className="absolute top-[65%] right-[8%]">
        <Droplets size={75} className="text-birtu" />
      </div>

      {/* baris bawah */}
      <div className="absolute bottom-[5%] left-[12%]">
        <ClipboardList size={70} className="text-birtu animate-pulse" />
      </div>
      <div className="absolute bottom-[5%] right-[12%]">
        <ReceiptText size={60} className="text-birtu" />
      </div>
    </div>
  );
};

export default BackgroundIcons;
