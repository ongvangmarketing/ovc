"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Real project images from sefamedia.vn
const projects = [
  { name: "Eurowindow", category: "Chiến lược thương hiệu", img: "https://sefamedia.vn/wp-content/uploads/2024/10/Eurowindow-min.png" },
  { name: "Bcons", category: "Chiến lược Marketing", img: "https://sefamedia.vn/wp-content/uploads/2024/10/Case-04-min.jpg" },
  { name: "Superware", category: "Chiến lược thương hiệu", img: "https://sefamedia.vn/wp-content/uploads/2024/10/superware.png" },
  { name: "DOCA", category: "Chiến lược kinh doanh", img: "https://sefamedia.vn/wp-content/uploads/2024/10/doca-1.png" },
  { name: "City Games", category: "Truyền thông tích hợp", img: "https://sefamedia.vn/wp-content/uploads/2024/10/City-game-1.jpg" },
  { name: "Britea", category: "Chiến lược thương hiệu", img: "https://sefamedia.vn/wp-content/uploads/2024/10/britea.png" },
  { name: "MB Bank", category: "Chiến lược Marketing", img: "https://sefamedia.vn/wp-content/uploads/2023/07/thumb-du-an-Digital-Mobile-App-MB-BANK-min.jpg" },
  { name: "DHC", category: "Chiến lược kinh doanh", img: "https://sefamedia.vn/wp-content/uploads/2023/06/dhc-1.png" },
  { name: "Agribank", category: "Truyền thông tích hợp", img: "https://sefamedia.vn/wp-content/uploads/2024/10/Agribank.jpg" },
  { name: "Guscent", category: "Chiến lược thương hiệu", img: "https://sefamedia.vn/wp-content/uploads/2024/10/Guscent-min-1.png" },
  { name: "Xluxury", category: "Chiến lược Marketing", img: "https://sefamedia.vn/wp-content/uploads/2024/10/Xluxury-1.jpg" },
  { name: "Bee Boo", category: "Chiến lược thương hiệu", img: "https://sefamedia.vn/wp-content/uploads/2024/10/beeboo.png" },
];

const tabs = ["TẤT CẢ", "Chiến lược thương hiệu", "Chiến lược Marketing", "Chiến lược kinh doanh", "Truyền thông tích hợp"];

export function SefaPortfolio({ basePath = "/ongvang" }: { basePath?: string }) {
  const [active, setActive] = useState("TẤT CẢ");

  const filtered = (active === "TẤT CẢ" ? projects : projects.filter((p) => p.category === active)).slice(0, 9);

  return (
    <>
      {/* Filter tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`relative rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
              active === tab
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-200/60"
                : "border border-orange-100 bg-white text-slate-600 shadow-sm hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={active}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((project, i) => (
            <motion.div
              key={project.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] }}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_22px_55px_rgba(249,115,22,0.16)] hover:ring-orange-200/70"
            >
              <div className="aspect-[3/2] overflow-hidden bg-orange-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.img}
                  alt={project.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
              {/* Overlay */}
              <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-slate-950/72 via-slate-950/18 to-transparent p-5 opacity-0 transition-all duration-500 group-hover:opacity-100">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.16em] text-orange-200">{project.category}</span>
                <h3 className="text-2xl font-black leading-tight text-white drop-shadow-sm">{project.name}</h3>
                <Link href={`${basePath}/lien-he`} className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-white/90 px-4 py-2 text-xs font-bold uppercase text-orange-600 shadow-lg shadow-slate-950/10 backdrop-blur transition-all hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-600 hover:text-white active:scale-95">
                  Xem chi tiết →
                </Link>
              </div>
              {/* Label always visible */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/68 via-slate-950/12 to-transparent p-4 pt-14 transition-all duration-300 group-hover:translate-y-2 group-hover:opacity-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-100/90 drop-shadow">{project.category}</p>
                <h3 className="mt-1 text-xl font-black leading-tight text-white drop-shadow-md">{project.name}</h3>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
