"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Upload, X } from "lucide-react";

interface ImageUploaderProps {
    value?: string;
    onChange: (value: string) => void;
}

export default function ImageUploader({ value, onChange }: ImageUploaderProps) {
    const [preview, setPreview] = useState<string | undefined>(value);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreview(result);
                onChange(result); // In real app, upload to server here and return URL
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemove = () => {
        setPreview(undefined);
        onChange("");
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-4">
            <div
                onClick={() => inputRef.current?.click()}
                className={`
                    relative group cursor-pointer
                    border-2 border-dashed rounded-2xl p-8
                    flex flex-col items-center justify-center
                    transition-all duration-200
                    ${preview ? 'border-transparent p-0 overflow-hidden aspect-video' : 'border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/10'}
                `}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />

                {preview ? (
                    <>
                        <img src={preview} alt="Event cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="text-white font-medium flex items-center gap-2">
                                <Upload className="w-4 h-4" /> Change Image
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemove();
                            }}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </>
                ) : (
                    <div className="text-center space-y-2">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                            <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Click to upload cover image</p>
                            <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
