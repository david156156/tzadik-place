import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import DeleteButton from "./DeleteButton";
import React from "react";
import { HDate } from "@hebcal/core";
import Link from "next/link";
import { promises } from "dns";

export default async function Post({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tzadik = await prisma.tzadik.findUnique({
    where: { id: parseInt(id) },
    include: { community: true },
  });

  if (!tzadik) {
    notFound();
  }

  async function handleDelete() {
    "use server";
    await prisma.tzadik.delete({ where: { id: parseInt(id) } });
    redirect("/");
  }

  function getTitle(tzadik: {
    gender?: string | null;
    community?: { name: string } | null;
  }) {
    if (tzadik.gender === "female" && tzadik.community) {
      const comm = tzadik.community.name.trim();
      if (comm.includes("תימן")) return "מרת";
      else return "הרבנית";
    }
    if (tzadik.gender === "male" && tzadik.community) {
      const comm = tzadik.community.name.trim();
      if (comm.includes("תימן")) return "מורי";
      else return "רבי";
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6">
      <div className="max-w-4xl mx-auto">
        {/* כותרת עליונה עם כפתורי עריכה ומחיקה */}
        <div className="flex justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="px-3 py-2 rounded-full bg-white border border-amber-200 text-amber-800 font-semibold shadow hover:bg-amber-50 transition"
              title="חזרה לרשימה"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-amber-900">
                {getTitle(tzadik)} {tzadik.name}{" "}
                {tzadik.gender === "male" ? 'זצ"ל' : 'ע"ה'}
              </h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/edit-tzadik/${tzadik.id}`}
              className="px-3 py-1 rounded-full bg-yellow-400 text-white font-semibold shadow hover:bg-yellow-500 transition"
              title="ערוך"
            >
              עריכה
            </Link>
            <DeleteButton onDelete={handleDelete} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* עמודת צד - פרטים ופעולות */}
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm shadow-xl border border-amber-100 rounded-2xl">
              <div className="border-b border-amber-100 px-6 py-4">
                <h2 className="text-lg text-amber-900 font-bold">
                  פרטים נוספים
                </h2>
              </div>
              <div className="flex flex-row justify-between border-b border-amber-100 px-6 py-4 text-black">
                <div>
                  {tzadik.birthDate && (
                    <div>
                      <span className="font-medium text-amber-800">
                        תאריך לידה:{" "}
                      </span>
                      {new Date(tzadik.birthDate).toLocaleDateString("he-IL")}
                    </div>
                  )}
                  {tzadik.deathDate && (
                    <div>
                      <span className="font-medium text-amber-800">
                        תאריך פטירה:{" "}
                      </span>
                      {/* תאריך לועזי */}
                      {new Date(tzadik.deathDate).toLocaleDateString("he-IL")}
                      {" | "}
                      {/* תאריך עברי */}
                      {(() => {
                        const hd = new HDate(new Date(tzadik.deathDate));
                        return hd.renderGematriya();
                      })()}
                    </div>
                  )}
                  {tzadik.country && (
                    <div>
                      <span className="font-medium text-amber-800">
                        מדינה:{" "}
                      </span>
                      {tzadik.country}
                    </div>
                  )}
                  {tzadik.city && (
                    <div>
                      <span className="font-medium text-amber-800">עיר: </span>
                      {tzadik.city}
                    </div>
                  )}
                  {tzadik.community && (
                    <div>
                      <span className="font-medium text-amber-800">
                        קהילה:{" "}
                      </span>
                      {tzadik.community.name}
                    </div>
                  )}
                </div>
                {/* פעולות מיקום */}
                {tzadik.location[0] && (
                  <div className=" backdrop-blur-sm  flex flex-col gap-3">
                    <Link
                      href={`https://maps.google.com/?q=${tzadik.location[0]},${tzadik.location[1]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-full bg-green-500 text-white font-semibold shadow hover:bg-green-600 transition text-sm text-center"
                      title="פתח ב-Google Maps"
                    >
                      פתח ב-Google Maps
                    </Link>
                    <Link
                      href={`https://waze.com/ul?ll=${tzadik.location[0]},${tzadik.location[1]}&navigate=yes`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition text-sm text-center"
                      title="פתח ב-Waze"
                    >
                      פתח ב-Waze
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* עמודת תוכן עיקרי */}
          <div className="lg:col-span-2 space-y-3">
            {/* תיאור המקום */}
            <div className="bg-white/90 backdrop-blur-sm shadow-xl border border-amber-100 rounded-2xl">
              <div className="border-b border-amber-100 px-6 py-4">
                <h2 className="text-xl text-amber-900 font-bold">
                  תיאור המקום
                </h2>
              </div>
              <div className="p-4">
                {tzadik.descriptionPlace ? (
                  <div className="prose max-w-none text-right text-slate-800 leading-relaxed">
                    {
                      <p className="mb-4 last:mb-0">
                        {tzadik.descriptionPlace}
                      </p>
                    }
                  </div>
                ) : (
                  <p className="text-slate-500 italic text-center">
                    אין מידע זמין
                  </p>
                )}
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm shadow-xl border border-amber-100 rounded-2xl">
              <div className="border-b border-amber-100 px-6 py-4">
                <h2 className="text-xl text-amber-900 font-bold">ביוגרפיה</h2>
              </div>
              <div className="p-4">
                {tzadik.biography && tzadik.biography.length > 0 ? (
                  <div className="prose max-w-none text-right text-slate-800 leading-relaxed">
                    {tzadik.biography.map((p: string, i: number) => (
                      <p key={i} className="mb-4 last:mb-0">
                        {p}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic text-center">
                    אין מידע זמין
                  </p>
                )}
              </div>
            </div>

            {/* {ספרים} */}
            <div className="bg-white/90 backdrop-blur-sm shadow-xl border border-amber-100 rounded-2xl">
              <div className="border-b border-amber-100 px-6 py-4">
                <h2 className="text-xl text-amber-900 font-bold">ספרים</h2>
              </div>
              <div className="p-4">
                {tzadik.books && tzadik.books.length > 0 ? (
                  <ul className="space-y-2">
                    {tzadik.books.map((book: string, index: number) => (
                      <li
                        key={index}
                        className="flex items-center gap-3 text-amber-900"
                      >
                        <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                        <span>{book}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 italic text-center">
                    אין מידע זמין
                  </p>
                )}
              </div>
            </div>

            {/* מאמרים */}
            <div className="bg-white/90 backdrop-blur-sm shadow-xl border border-amber-100 rounded-2xl">
              <div className="border-b border-amber-100 px-6 py-4">
                <h2 className="text-xl text-amber-900 font-bold">מאמרים</h2>
              </div>
              <div className="p-4">
                {tzadik.article && tzadik.article.length > 0 ? (
                  <ul className="space-y-2">
                    {tzadik.article.map((article: string, index: number) => (
                      <li
                        key={index}
                        className="flex items-center gap-3 text-amber-900"
                      >
                        <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                        <span>{article}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 italic text-center">
                    אין מידע זמין
                  </p>
                )}
              </div>
            </div>

            {/* תמונה ראשית */}
            {tzadik.mainImage && (
              <div className="bg-white/90 backdrop-blur-sm shadow-xl border border-amber-100 rounded-2xl">
                <div className="border-b border-amber-100 px-6 py-4">
                  <h2 className="text-xl text-amber-900 font-bold">
                    תמונה ראשית
                  </h2>
                </div>
                <div className="p-6 flex justify-center">
                  <img
                    src={tzadik.mainImage}
                    alt={tzadik.name}
                    className="rounded-lg max-h-64"
                  />
                </div>
              </div>
            )}
            {/* תמונות נוספות */}
            {tzadik.images &&
              Array.isArray(tzadik.images) &&
              tzadik.images.length > 0 && (
                <div className="bg-white/90 backdrop-blur-sm shadow-xl border border-amber-100 rounded-2xl">
                  <div className="border-b border-amber-100 px-6 py-4">
                    <h2 className="text-xl text-amber-900 font-bold">
                      תמונות נוספות
                    </h2>
                  </div>
                  <div className="p-6 flex flex-wrap gap-3">
                    {tzadik.images.map((img: string, i: number) =>
                      img ? (
                        <img
                          key={i}
                          src={img}
                          alt={`תמונה ${i + 1}`}
                          className="rounded max-h-32 border"
                        />
                      ) : null
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
