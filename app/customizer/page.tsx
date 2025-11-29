"use client";

import React, { useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, TransformControls } from "@react-three/drei";
import { STLLoader } from "three-stdlib";
import { useLoader } from "@react-three/fiber";
import { Mesh, BufferGeometry } from "three";
import { cn } from "@/lib/utils";
import { Upload, X, Box, Layers } from "lucide-react";

// Component to render an STL file
const Model = ({ url, color, position, rotation, isSelected, onSelect }: any) => {
    const geom = useLoader(STLLoader, url) as BufferGeometry;

    return (
        <mesh
            geometry={geom}
            position={position}
            rotation={rotation}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
        >
            <meshStandardMaterial color={isSelected ? "#6366f1" : color} />
        </mesh>
    );
};

// Wrapper for TransformControls
const MovableModel = ({ url, id, isSelected, onSelect, onTransform }: any) => {
    const [position, setPosition] = useState([0, 0, 0]);
    const [rotation, setRotation] = useState([0, 0, 0]);

    return (
        <>
            {isSelected ? (
                <TransformControls
                    mode="translate"
                    onObjectChange={(e: any) => {
                        setPosition([e.target.object.position.x, e.target.object.position.y, e.target.object.position.z]);
                    }}
                >
                    <Model url={url} color="#cbd5e1" position={position} rotation={rotation} isSelected={isSelected} onSelect={onSelect} />
                </TransformControls>
            ) : (
                <Model url={url} color="#cbd5e1" position={position} rotation={rotation} isSelected={isSelected} onSelect={onSelect} />
            )}
        </>
    )
}


export default function CustomizerPage() {
    // Default to the provided STL files
    const [mainBoard, setMainBoard] = useState<string | null>("/laser cut1.stl");
    const [modules, setModules] = useState<{ id: string; url: string; name: string }[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Load the default module set on mount
    React.useEffect(() => {
        setModules([
            {
                id: "default-set",
                url: "/All Together STL File from Nexus International School.stl",
                name: "Nexus Module Set"
            }
        ]);
    }, []);

    const handleMainBoardUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.name.toLowerCase().endsWith(".stl")) {
                alert("Please upload a valid .stl file.");
                return;
            }
            const url = URL.createObjectURL(file);
            setMainBoard(url);
        }
    };

    const handleModuleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.name.toLowerCase().endsWith(".stl")) {
                alert("Please upload a valid .stl file.");
                return;
            }
            const url = URL.createObjectURL(file);
            setModules((prev) => [
                ...prev,
                { id: Math.random().toString(36).substr(2, 9), url, name: file.name },
            ]);
        }
    };

    const removeModule = (id: string) => {
        setModules((prev) => prev.filter((m) => m.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col md:flex-row pt-16">
            {/* Sidebar Controls */}
            <div className="w-full md:w-80 bg-neutral-900 border-r border-neutral-800 p-6 flex flex-col gap-6 overflow-y-auto h-[calc(100vh-4rem)]">
                <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Box className="w-5 h-5 text-indigo-500" /> Main Board
                    </h2>
                    <div className="p-4 border border-dashed border-neutral-700 rounded-lg hover:bg-neutral-800/50 transition-colors text-center cursor-pointer relative">
                        <input
                            type="file"
                            accept=".stl"
                            onChange={handleMainBoardUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-2">
                            <Upload className="w-6 h-6 text-neutral-400" />
                            <span className="text-sm text-neutral-400">
                                {mainBoard ? "Change Board STL" : "Upload Board STL"}
                            </span>
                        </div>
                    </div>
                    {mainBoard && <p className="text-xs text-neutral-500 mt-2 text-center">Current: Laser Cut Board</p>}
                </div>

                <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-indigo-500" /> Modules
                    </h2>
                    <div className="p-4 border border-dashed border-neutral-700 rounded-lg hover:bg-neutral-800/50 transition-colors text-center cursor-pointer relative mb-4">
                        <input
                            type="file"
                            accept=".stl"
                            onChange={handleModuleUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-2">
                            <Upload className="w-6 h-6 text-neutral-400" />
                            <span className="text-sm text-neutral-400">Add Module STL</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {modules.map((mod) => (
                            <div
                                key={mod.id}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded bg-neutral-800 border border-neutral-700 cursor-pointer hover:bg-neutral-700/50 transition-colors",
                                    selectedId === mod.id && "border-indigo-500 ring-1 ring-indigo-500"
                                )}
                                onClick={() => setSelectedId(mod.id)}
                            >
                                <span className="text-sm truncate max-w-[150px]">{mod.name}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeModule(mod.id);
                                    }}
                                    className="text-neutral-500 hover:text-red-400 p-1"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {modules.length === 0 && (
                            <p className="text-xs text-neutral-500 text-center">No modules added yet.</p>
                        )}
                    </div>
                </div>

                <div className="mt-auto">
                    <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                        <p className="text-xs text-indigo-300">
                            <strong>Tip:</strong> The default board and module set are pre-loaded. You can upload your own custom files if needed.
                        </p>
                    </div>
                </div>
            </div>
            {/* 3D Viewer */}
            <div className="flex-1 bg-neutral-950 relative">
                <Canvas shadows camera={{ position: [50, 50, 50], fov: 50 }}>
                    <Stage environment="city" intensity={0.5}>
                        {mainBoard && (
                            <Model
                                url={mainBoard}
                                color="#334155"
                                position={[0, 0, 0]}
                                rotation={[-Math.PI / 2, 0, 0]}
                                isSelected={false}
                                onSelect={() => setSelectedId(null)}
                            />
                        )}
                        {modules.map((mod) => (
                            <MovableModel
                                key={mod.id}
                                url={mod.url}
                                id={mod.id}
                                isSelected={selectedId === mod.id}
                                onSelect={() => setSelectedId(mod.id)}
                            />
                        ))}
                    </Stage>
                    <OrbitControls makeDefault />
                </Canvas>

                {(!mainBoard && modules.length === 0) && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center p-6 bg-black/50 backdrop-blur-md rounded-xl border border-white/10">
                            <p className="text-neutral-400">Upload a Main Board STL to start</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
