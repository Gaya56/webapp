import { useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import { Eye, Image, MoreVertical, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

import Loading from "@/components/Loading";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { showOverlayLoadingAtom } from "@/config/state";
import apiClient from "@/lib/apiClient";
import { ALL_BOTS } from "@/config/chatbots";
import useAuth from "@/hooks/useAuth";

function History() {
  const { botId } = useParams();
  const { currentUser } = useAuth();
  
  const bot = ALL_BOTS.find((bot) => bot.botId === botId);
  
  const setShowOverlayLoading = useSetAtom(showOverlayLoadingAtom);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    fetch();
  }, [currentUser]);

  const fetch = async () => {
    setLoading(true);

    const { data, ok } = await apiClient.get(
      `/generate-image/${encodeURIComponent(bot.modelName)}/history`
    );
    setLoading(false);

    if (!ok) return toast.error(data?.error || data);

    setImages(data.images);
  };

  const remove = async (id) => {
    setShowOverlayLoading(true);

    const { data, ok } = await apiClient.get(
      `/generate-image/${encodeURIComponent(bot.modelName)}/remove/${id}`
    );
    setShowOverlayLoading(false);

    if (!ok) return toast.error(data);

    setImages((prevImages) =>
      prevImages.filter((im) => im.id !== id)
    );
  };

  return (
    <div className="p-5">
      <p className="text-xl font-bold">{bot.bot.name} Assets</p>

      {loading && (
        <div className="flex justify-center mt-12">
          <Loading className="w-10 h-10" />
        </div>
      )}

      <div className="grid grid-cols-4 xl:grid-cols-6 gap-4 mt-6">
        {images.map((image, index) => (
          <div key={index} className="shadow p-3 rounded-xl border border-gray-200">
            <div className="flex mb-4 justify-between">
              <Image size={20} />

              <Popover>
                <PopoverTrigger>
                  <MoreVertical size={20} />
                </PopoverTrigger>
                <PopoverContent className="!p-1 text-sm !w-fit">
                  <a
                    href={image.url}
                    target="_blank"
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    <Eye size={15} />
                    <p>View in new tab</p>
                  </a>

                  <div
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => remove(image.id)}
                  >
                    <Trash2 size={15} className="text-red-500" />
                    <p>Delete asset</p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <img
              key={index}
              src={image.url}
              className="w-full rounded-lg"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default History;
