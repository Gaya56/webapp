import { showOverlayLoadingAtom } from "@/config/state";
import { useSetAtom } from "jotai";
import { ShieldCheckIcon, StarIcon, GiftIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ReactPixel from "react-facebook-pixel";
import { useMediaQuery } from "react-responsive";

import apiClient from "@/lib/apiClient";
import Timer from "@/components/Timer";

const comments = [
  {
    name: "Joachim",
    role: "CEO - GroupUltra",
    rating: 5,
    comment:
      "Combochat is an absolutely fantastic product with multiple uses. I recently had a 15-minute call with their support team, and they didn't leave until I was completely satisfied.",
    image: "/images/ItfZZbbQGg9sfTB3XnO5cf8d4kQ.png",
  },
  {
    name: "Max K",
    role: "Software Engineer",
    rating: 5,
    comment:
      "Brilliant and easy to use - Read the reviews and decided to purchase this.\n\n I was not disappointed. Similar to another product, but does so much more.",
    image: "/images/JENK2BrHEiL4Wn45015KDgn7U.png",
  },
  {
    name: "Alex Joes",
    role: "Managing Director",
    rating: 5,
    comment:
      "The ability to access 6 perspectives simultaneously is simply revolutionary.\n\n This feature alone has saved me countless hours of research and deliberation.",
    image: "/images/UotOtpi9XWLAXbwhz9LHuhrpW8.webp",
  },
  {
    name: "Clara H.",
    role: "Stanford Researcher",
    rating: 5,
    comment:
      "I'm struggling comparing GPTs for my different teams in the company but this is the solution that will help me with it.",
    image: "/images/lFW8txPGzQuUVcEcDh5Bh2YUjw.webp",
  },
  {
    name: "Amr Mohsin",
    role: "Software Engineer",
    rating: 5,
    comment:
      "Going from one model to another to find the answer you're looking for is tiring. This is simply AMAZING!",
    image: "/images/yQ1jW7hzDDy3qJGDYyCVCBmm5w.png",
  },
  {
    name: "Selana Yuri",
    role: "CEO - GroupUltra",
    rating: 5,
    comment:
      "In my role I have lots of responsibilities that require lots of reading of documentation which is boring & tiring.\n\n With this tool, we quickly compare multiple AIs and then get a consensus of all their answers, which gives me more options to find a suitable answer.",
    image: "/images/YvbHP05F6O39tCTxxUq9vnKuno.png",
  },
  {
    name: "Brandon C.",
    role: "Head of Product",
    rating: 5,
    comment:
      "Wow, I bought tier 2, but then when I started using it, I realized it was really powerful and upgraded to tier 3.\n\n It's like to have 6 people expressing their opinions right at your finger tips.\n\n Great idea and great app.",
    image: "/images/gnKpBQC0WyJ8F9olMv6twnRjySc.webp",
  },
  {
    name: "Carter L.",
    role: "Growth Marketer",
    rating: 5,
    comment:
      "I love how you can customize the AI to get responses that fit exactly what you need.\n\n Plus, the Copilot feature is a game-changer—it gives you real-time help right on any webpage!",
    image: "/images/OLi0cqPlPp4Zz2fRUa15dEKhg4.webp",
  },
];

const testemonials = [
  "Comparing AI outputs is so helpful",
  "Better than ChatGPT",
  "I love using multiple AI's in one interface",
];

const plans = [
  {
    id: "A-monthly",
    name: "1-month plan",
    price: "30.00",
    originalPrice: "",
    period: "/ month",
    freeTrial: true,
    freeTrialText: "7-day free trial",
  },
  {
    id: "A-yearly",
    name: "Annual Plan",
    price: "15.00",
    originalPrice: "",
    period: "/ month",
    popular: true,
    annual: true,
    badge: "12 month plan",
    freeTrial: true,
    freeTrialText: "7-day free trial",
  }
];

function NewPricing() {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const setShowOverlayLoading = useSetAtom(showOverlayLoadingAtom);

  const [selectedPlan, setSelectedPlan] = useState("A-yearly");

  useEffect(() => {
    ReactPixel.track("ViewContent");
    window.plausible.trackEvent("View Pricing Popup");
  }, []);

  const redirectToCheckout = async (newPlanId, isYearly = false) => {
    setShowOverlayLoading(true);

    // retrieve tlt cookie from tolt_referral
    const tlt = window.tolt_referral;

    const { data, ok } = await apiClient.get(
      `/premium/get-redirect-url?checked=true&newPlanId=${newPlanId}&isYearly=${isYearly}${
        tlt ? `&tolt_referral=${tlt || ""}` : ""
      }`
    );

    if (!ok) {
      setShowOverlayLoading(false);
      return toast.error("An error occurred while creating session");
    }

    ReactPixel.track("InitiateCheckout");
    window.plausible.trackEvent("Initiate Checkout");

    await new Promise((r) => setTimeout(r, 1000));

    setShowOverlayLoading(false);
    window.open(data.url, "_self");
  };

  const Plans = () => (
    <div className="max-w-6xl mx-auto mt-8 flex flex-col items-center justify-center">
      {/* <p className="text-center text-2xl xl:text-4xl font-bold mb-8">
        Choose your plan
      </p> */}

      <div className="flex flex-col md:flex-row md:items-end w-full gap-4 p-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`relative flex-1 p-6 w-full rounded-2xl cursor-pointer transition-all duration-300 ${
              selectedPlan === plan.id
                ? "border-2 border-[#8b5cf6] bg-white dark:bg-zinc-900 shadow-lg"
                : "bg-[#F5F5FA] dark:bg-zinc-900"
            }`}
            style={{
              boxShadow:
                selectedPlan === plan.id
                  ? "0 8px 32px 0 rgba(139,92,246,0.10)"
                  : undefined,
            }}
          >
            {/* Free trial badge */}
            {plan.freeTrial && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-gradient-to-r from-[#a78bfa] to-[#8b5cf6] text-white px-4 py-1 rounded-full shadow-md text-xs font-semibold z-10 border-2 border-white dark:border-zinc-900">
                <GiftIcon size={16} className="mr-1" />
                {plan.freeTrialText}
              </div>
            )}

            <div className="flex gap-2 items-center mt-4">
              <div className="relative w-5 h-5">
                <div
                  className={`absolute inset-0 rounded-full border-2 transition-colors duration-300 ${
                    selectedPlan === plan.id
                      ? "border-[#8b5cf6]"
                      : "border-gray-300"
                  }`}
                />

                <div
                  className={`absolute inset-2 rounded-full transition-transform duration-300 ${
                    selectedPlan === plan.id
                      ? "bg-[#8b5cf6] scale-[2.5]"
                      : "bg-[#8b5cf6] scale-0"
                  }`}
                />
              </div>
              <h3 className="text-lg">{plan.name}</h3>

              {plan.popular && (
                <div className="bg-[#8b5cf6] text-white text-center py-1 px-2 rounded-md ml-auto text-xs">
                  MOST POPULAR
                </div>
              )}
            </div>

            <div className="flex items-end mt-4 justify-between w-full">
              <div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-medium">${plan.price}</span>
                  {plan.originalPrice && (
                    <span className="text-gray-500 line-through text-xl">
                      ${plan.originalPrice}
                    </span>
                  )}
                </div>

                {plan.period && (
                  <div className="text-gray-600 mt-1 ml-auto font-light">
                    {plan.period}
                  </div>
                )}
              </div>

              {plan.badge && (
                <div className="inline-block bg-[#DEF0FE] dark:bg-blue-700/30 text-sm px-3 py-1 rounded-md mt-2">
                  {plan.badge}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Free trial info below plans for extra emphasis */}
      <div className="flex items-center justify-center mt-4 mb-2">
        <GiftIcon size={20} className="text-[#8b5cf6] mr-2" />
        <span className="text-[#8b5cf6] font-semibold text-base">
          All plans include a 7-day free trial. Cancel anytime.
        </span>
      </div>

      <button
        className="bg-[#8b5cf6] text-white px-32 lg:px-44 py-4 rounded-xl mt-8 font-medium shadow-md hover:bg-[#7c3aed] transition"
        onClick={() => {
          redirectToCheckout(selectedPlan);
        }}
      >
        Start Free Trial
      </button>

      <div className="flex items-center gap-1 text-gray-600 mt-6">
        <ShieldCheckIcon size={18} />
        <p className="text-sm">Fully secured SSL checkout</p>
      </div>

      <img src="/images/cards.svg" className="mt-2" />
    </div>
  );

  return (
    <div>
      <div className="flex justify-center fixed top-5 pb-1 left-1/2 transform -translate-x-1/2 z-10 w-full dark:bg-black">
        <Timer />
      </div>
      <div className="mt-12"></div>

      {/* Upgrade */}
      <p className="text-center text-2xl xl:text-4xl font-bold">
        You're on a roll 🚀 upgrade to unlock unlimited queries!
      </p>

      <Plans />

      {/* Models */}
      {/* <p className="text-center text-2xl xl:text-4xl font-bold mt-16">
        Access 40+ Chat, Code, and Image Models
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-auto mt-8 lg:mt-12 max-w-5xl">
        {aiModels.map((model) => (
          <div
            key={model.name}
            className="border rounded-xl p-3 flex items-center gap-2"
          >
            <img
              src={model.image}
              className="rounded-lg w-10 h-10 object-cover"
            />
            <div>
              <p className="text-sm font-bold">{model.name}</p>
              <p className="text-sm text-gray-500">{model.provider}</p>
            </div>

            <div className="flex flex-col items-end gap-2 ml-auto">
              <p className="text-xs text-gray-800 bg-blue-100 px-2 py-1 rounded-lg">
                {model.type}
              </p>
              <p className="text-sm text-gray-500">{model.context}</p>
            </div>
          </div>
        ))}
      </div> */}

      {/* star testemonials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mx-auto mt-8 lg:mt-12 max-w-6xl">
        {testemonials.map((feature, idx) => {
          if (isMobile && idx < 2) return null;

          return (
            <div key={feature}>
              <div className="flex justify-center mt-6 gap-3">
                {/* display five golden stars with loop */}
                {Array.from({ length: 5 }).map((_, idx) => (
                  <StarIcon
                    size={21}
                    key={idx}
                    className="text-amber-500 fill-amber-500"
                  />
                ))}
              </div>

              <p className="mx-auto mt-2 2xl:mt-3 max-w-2xl text-center text-[17px] 2xl:text-lg leading-8 text-gray-600">
                "{feature}"
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-auto mt-8 lg:mt-12 max-w-6xl">
        <div className="border border-red-400 rounded-lg">
          <img
            src="/images/wUkgndv7l0t0KZVp267x7i3z7Ew.jpg"
            className="rounded-lg"
          />
        </div>

        <div className="border border-green-400 rounded-lg">
          <img
            src="/images/Up0ZvQI726ZI05Ut5Jcpu9EtQ.jpg"
            className="rounded-lg"
          />
        </div>
      </div>

      {/* Testemonials */}
      <p className="text-center text-2xl xl:text-4xl font-bold mt-16">
        The #1 Platform for Comparing AI Models
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-8 mx-auto mt-8 lg:mt-12 max-w-5xl lg:max-w-7xl mb-12">
        {comments.map((comment) => (
          <div
            key={comment.name}
            className="border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 h-fit"
            style={{
              boxShadow:
                "0px 16px 40px 0px rgba(0, 0, 0, 0.029999999329447746)",
            }}
          >
            <img
              src={comment.image}
              className="rounded-full w-12 h-12 border border-gray-400"
            />

            {/* name and role */}
            <div className="flex flex-col mb-2 mt-2">
              <p className="text-sm font-bold">{comment.name}</p>
              <p className="text-sm text-gray-500">{comment.role}</p>
            </div>

            <div className="flex gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <img
                  key={idx}
                  src="/images/iLN6I9SXjGLbxdf9157YIR4yBA.png"
                  className="w-4 h-4"
                />
              ))}
            </div>

            <p className="text-[14px] text-slate-500 whitespace-break-spaces">
              "{comment.comment}"
            </p>
          </div>
        ))}
      </div>

      <div className="mb-12">
        <Plans />
      </div>
    </div>
  );
}

export default NewPricing;
