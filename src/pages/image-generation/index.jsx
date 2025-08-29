import { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { Link, redirect, useParams } from "react-router-dom";
import {
  Download,
  Eye,
  Image,
  ImageIcon,
  X as XIcon,
} from "lucide-react";
import { useSetAtom } from "jotai";

import apiClient from "@/lib/apiClient";
import Loading from "@/components/Loading";
import increaseUsage from "@/lib/increaseUsage";
import { currentUserAtom } from "@/config/state";
import getAiModelApiKey from "@/lib/getAiModelApiKey";
import { ALL_BOTS } from "@/config/chatbots";
import uploadFile from "@/lib/uploadFile";
import { cn } from "@/lib/shadcn";
import useAuth from "@/hooks/useAuth";

function ImageGeneration() {
  const fileInputRef = useRef(null);

  const { botId } = useParams();
  const { currentUser } = useAuth();
  
  const setCurrentUser = useSetAtom(currentUserAtom);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentImages, setRecentImages] = useState([]);
  const [generatedImage, setGeneratedImage] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const bot = ALL_BOTS.find((bot) => bot.botId === botId);

  useEffect(() => {
    if (!bot) return redirect("/");
    if (!currentUser) return;

    fetch();
  }, [botId]);

  const fetch = async () => {
    setFetchLoading(true);
    setGeneratedImage("");
    setRecentImages([]);

    const { data, ok } = await apiClient.get(
      `/generate-image/${encodeURIComponent(bot.modelName)}/history`,
      {
        limit: 6,
      }
    );
    setFetchLoading(false);

    if (!ok) return toast.error(data?.error || data);

    setRecentImages(data.images.map((im) => im.url));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const generate = async () => {
    if (loading || uploading) return;

    if (prompt.length < 10)
      return toast.error("Please enter a prompt with at least 10 characters.");

    let uploadedImageUrl = null;

    if (selectedFile) {
      setUploading(true);
      uploadedImageUrl = await uploadFile(selectedFile);
      setUploading(false);

      if (!uploadedImageUrl) {
        return toast.error("Failed to upload image. Please try again.");
      }
    }

    setLoading(true);
    setGeneratedImage("");

    const payload = {
      prompt,
      apiKey: getAiModelApiKey(botId),
      model: bot.modelName,
    };

    if (uploadedImageUrl) {
      payload.image = uploadedImageUrl;
    }

    const { data, ok } = await apiClient.post(
      `/generate-image/${botId}`,
      payload
    );
    setLoading(false);

    if (!ok) return toast.error(data);

    setPrompt("");
    setGeneratedImage(data.url);
    setSelectedFile(null);

    let newRecentImages = [data.url, ...recentImages];
    if (newRecentImages.length > 6) newRecentImages.pop();
    setRecentImages(newRecentImages);

    increaseUsage("pro", setCurrentUser, 5, botId);
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="grid grid-cols-5 h-full mb-5">
        <div className="col-span-3">
          <p className="text-xl font-bold">{bot.bot.name}</p>

          <div className="flex flex-col items-center w-full h-full mt-24 2xl:mt-32">
            {(loading || uploading) && (
              <div className="w-96 h-96 bg-gray-100 dark:bg-zinc-800 rounded-xl flex flex-col justify-center items-center animate-pulse">
                <Image size={30} className="text-gray-500" />

                <p className="mt-2 text-sm">
                  {uploading
                    ? "Uploading image..."
                    : "Images can take up to 30 seconds to generate."}
                </p>
              </div>
            )}

            {generatedImage && (
              <div className="flex items-end">
                <img src={generatedImage} className="w-96 rounded-xl" />

                <a
                  href={generatedImage}
                  target="_blank"
                  className="w-8 h-8 rounded-full bg-gray-200 cursor-pointer flex justify-center items-center ml-3"
                  rel="noopener noreferrer"
                >
                  <Download size={17} className="cursor-pointer" />
                </a>
              </div>
            )}

            {!loading && !uploading && !generatedImage && (
              <>
                <div className="w-20 h-20 rounded-full p-4 from-gray-200/50 to-gray-100/60 flex justify-center items-center border border-gray-200">
                  <img src={bot.bot.avatar} className="w-full" />
                </div>

                <p className="text-2xl font-bold mt-4 w-96 text-center">
                  What image will you create today?
                </p>
              </>
            )}
          </div>
        </div>

        <div className="col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col overflow-y-auto h-[87vh]">
          <div className="flex justify-between items-center">
            <p className="font-bold">Recent image generations</p>

            {recentImages.length > 0 && (
              <Link
                to={`/generate-image/${botId}/history`}
                className="bg-primary-blue px-3 py-2 text-white whitespace-nowrap rounded-lg flex items-center"
              >
                <Eye size={17} className="mr-2" />
                <span className="text-sm">View all images</span>
              </Link>
            )}
          </div>

          {!recentImages.length ? (
            <div className="flex justify-center items-center h-full">
              {fetchLoading ? (
                <Loading className="text-black" />
              ) : (
                <p className="text-gray-500 text-sm">
                  You have not created any images yet.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 w-full mt-6">
              {recentImages.map((image, index) => (
                <img key={index} src={image} className="w-full rounded-lg" />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center">
        {botId == "flux-kontext" && (
          <div
            className={cn(
              "relative flex items-center",
              selectedFile ? "pr-5 mr-4" : "mr-2"
            )}
          >
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={loading || uploading}
              title="Upload an image to use as input"
              className="relative"
              style={{ padding: 0, border: "none", background: "none" }}
            >
              <ImageIcon size={23} className="text-gray-500" />
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
                disabled={loading || uploading}
              />
            </button>
            {selectedFile && (
              <button
                type="button"
                onClick={handleRemoveSelectedFile}
                className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 border border-gray-200 shadow dark:bg-background dark:border-gray-700"
                style={{ lineHeight: 0 }}
                title="Remove selected image"
                tabIndex={0}
              >
                <XIcon size={16} className="text-red-500" />
              </button>
            )}

            {selectedFile && (
              <span
                className="ml-2 text-xs text-gray-600 max-w-[120px] truncate"
                title={selectedFile.name}
              >
                {selectedFile.name}
              </span>
            )}
          </div>
        )}

        <input
          type="text"
          className="p-2.5 rounded-lg border border-gray-200 text-sm w-full h-fit dark:bg-background dark:border-gray-700"
          placeholder="Type your image prompt here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading || uploading}
          onInput={(e) => {
            // handle enter key
          }}
        />

        <button
          className="bg-primary-blue px-5 py-2.5 text-white whitespace-nowrap rounded-lg ml-3 text-sm"
          onClick={() => generate()}
          disabled={loading || uploading}
        >
          Generate Image
        </button>
      </div>
    </div>
  );
}

export default ImageGeneration;
