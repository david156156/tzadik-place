import { Gender } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function EditTzadik({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tzadik = await prisma.tzadik.findUnique({
    where: { id: parseInt(id) },
    include: { community: true },
  });

  if (!tzadik) {
    return <div className="text-center mt-10">צדיק לא נמצא</div>;
  }

  async function updateTzadik(formData: FormData) {
    "use server";
    const communityName = (formData.get("community") as string)?.trim();

    let communityConnect = undefined;
    if (communityName) {
      // נסה למצוא קהילה קיימת
      let community = await prisma.community.findUnique({
        where: { name: communityName },
      });
      // אם לא קיימת - צור אותה
      if (!community) {
        community = await prisma.community.create({
          data: { name: communityName },
        });
      }
      communityConnect = { connect: { name: communityName } };
    }
    await prisma.tzadik.update({
      where: { id: parseInt(id) },
      data: {
        name: formData.get("name") as string,
        gender: formData.get("gender") as Gender,
        community: communityConnect,
        birthDate: formData.get("birthDate")
          ? new Date(formData.get("birthDate") as string)
          : null,
        deathDate: formData.get("deathDate")
          ? new Date(formData.get("deathDate") as string)
          : null,
        location: formData.get("location")
          ? (formData.get("location") as string)
              .split(",")
              .map((coord) => parseFloat(coord.trim()))
              .filter((num) => !isNaN(num))
          : [],
        descriptionPlace: formData.get("descriptionPlace") as string,
        mainImage: formData.get("mainImage") as string,
        images:
          (formData.get("images") as string)
            ?.split(",")
            .map((s) => s.trim())
            .filter(Boolean) ?? [],
        biography: formData.get("biography")
          ? (formData.get("biography") as string)
              .split("\n")
              .map((p) => p.trim())
              .filter(Boolean)
          : [],
        article: formData.get("article")
          ? [formData.get("article") as string]
          : [],
        books:
          (formData.get("books") as string)
            ?.split(",")
            .map((s) => s.trim())
            .filter(Boolean) ?? [],
        country: formData.get("country") as string,
        city: formData.get("city") as string,
      },
    });
    redirect(`/${id}`);
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center py-12"
    >
      <div className="w-full flex justify-end max-w-2xl mb-8">
        <Link
          href={`/${id}`}
          className="px-4 py-1 rounded-full bg-gradient-to-r from-amber-700 to-amber-800 text-white font-semibold shadow hover:from-amber-800 hover:to-amber-900 hover:scale-105 transition-all duration-200"
        >
          חזרה לפרופיל
        </Link>
      </div>
      <div className="w-full max-w-2xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-100 p-10">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-amber-900 font-[family-name:var(--font-geist-sans)]">
          עריכת צדיק
        </h1>
        <form action={updateTzadik} className="space-y-6">
          {/* שם */}
          <div>
            <label
              htmlFor="name"
              className="block text-lg mb-2 font-semibold text-amber-900"
            >
              שם
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={tzadik.name ?? ""}
              placeholder="הכנס שם הצדיק"
              className="w-full px-4 py-2 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none transition placeholder-gray-500 text-gray-800 bg-amber-50"
              required
            />
          </div>
          {/* מגדר */}
          <div>
            <label
              htmlFor="gender"
              className="block text-lg mb-2 font-semibold text-amber-900"
            >
              מגדר
            </label>
            <select
              id="gender"
              name="gender"
              defaultValue={tzadik.gender ?? "male"}
              className="w-full px-4 py-2 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none transition placeholder-gray-500 text-gray-800 bg-amber-50"
            >
              <option value="male">זכר</option>
              <option value="female">נקבה</option>
            </select>
          </div>
          {/* קהילה */}
          <div>
            <label
              htmlFor="community"
              className="block text-lg mb-2 font-semibold text-amber-900"
            >
              קהילה
            </label>
            <input
              type="text"
              id="community"
              name="community"
              defaultValue={tzadik.community?.name ?? ""}
              placeholder="הכנס שם קהילה"
              className="w-full px-4 py-2 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none transition placeholder-gray-500 text-gray-800 bg-amber-50"
            />
          </div>
          {/* תאריך לידה */}
          <div>
            <label
              htmlFor="birthDate"
              className="block text-lg mb-2 font-semibold text-amber-900"
            >
              תאריך לידה
            </label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              defaultValue={
                tzadik.birthDate
                  ? tzadik.birthDate.toISOString().split("T")[0]
                  : ""
              }
              className="w-full px-4 py-2 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none transition placeholder-gray-500 text-gray-800 bg-amber-50"
            />
          </div>
          {/* תאריך פטירה */}
          <div>
            <label
              htmlFor="deathDate"
              className="block text-lg mb-2 font-semibold text-amber-900"
            >
              תאריך פטירה
            </label>
            <input
              type="date"
              id="deathDate"
              name="deathDate"
              defaultValue={
                tzadik.deathDate
                  ? tzadik.deathDate.toISOString().split("T")[0]
                  : ""
              }
              className="w-full px-4 py-2 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none transition placeholder-gray-500 text-gray-800 bg-amber-50"
            />
          </div>
          {/* מיקום */}
          <div>
            <label
              htmlFor="location"
              className="block text-lg mb-2 font-semibold text-amber-900"
            >
              מיקום
            </label>
            <input
              type="text"
              id="location"
              name="location"
              defaultValue={tzadik.location?.join(", ") ?? ""}
              placeholder="הכנס מיקום"
              className="w-full px-4 py-2 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none transition placeholder-gray-500 text-gray-800 bg-amber-50"
            />
          </div>
          {/* תיאור המקום */}
          <div>
            <label
              htmlFor="descriptionPlace"
              className="block text-lg mb-2 font-semibold text-amber-900"
            >
              תיאור המקום
            </label>
            <textarea
              id="descriptionPlace"
              name="descriptionPlace"
              defaultValue={tzadik.descriptionPlace ?? ""}
              placeholder="הכנס תיאור למיקום"
              className="w-full px-4 py-2 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none transition placeholder-gray-500 text-gray-800 bg-amber-50"
              rows={4}
            />
          </div>
          {/* כתובת התמונה הראשית */}
          <div>
            <label
              htmlFor="mainImage"
              className="block text-lg mb-2 font-semibold text-amber-900"
            >
              כתובת התמונה הראשית
            </label>
            <input
              type="text"
              id="mainImage"
              name="mainImage"
              defaultValue={tzadik.mainImage ?? ""}
              placeholder="הכנס כתובת URL של התמונה הראשית"
              className="w-full px-4 py-2 border-2 border-amber-400 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none transition placeholder-gray-500 text-gray-800 bg-amber-50"
            />
          </div>
          {/* כתובות תמונות נוספות */}
          <div>
            <label
              htmlFor="images"
              className="block text-lg mb-2 font-semibold text-amber-900"
            >
              כתובות תמונות נוספות
            </label>
            <input
              type="text"
              id="images"
              name="images"
              defaultValue={tzadik.images?.join(", ") ?? ""}
              placeholder="הכנס כתובות תמונות מופרדות בפסיקים"
              className="w-full px-4 py-2 border-2 border-amber-400 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none transition placeholder-gray-500 text-gray-800 bg-amber-50"
            />
          </div>
          {/* ביוגרפיה */}
          <div>
            <label
              htmlFor="biography"
              className="block text-lg mb-2 font-semibold text-amber-900"
            >
              ביוגרפיה
            </label>
            <textarea
              id="biography"
              name="biography"
              defaultValue={
                Array.isArray(tzadik.biography)
                  ? tzadik.biography.join("\n")
                  : tzadik.biography ?? ""
              }
              placeholder="הכנס ביוגרפיה"
              className="w-full px-4 py-2 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none transition placeholder-gray-500 text-gray-800 bg-amber-50"
              rows={4}
            />
          </div>
          {/* מאמר */}
          <div>
            <label
              htmlFor="article"
              className="block text-lg mb-2 font-semibold text-amber-900"
            >
              מאמר
            </label>
            <textarea
              id="article"
              name="article"
              defaultValue={
                Array.isArray(tzadik.article)
                  ? tzadik.article.join("\n")
                  : tzadik.article ?? ""
              }
              placeholder="הכנס מאמר"
              className="w-full px-4 py-2 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none transition placeholder-gray-500 text-gray-800 bg-amber-50"
              rows={4}
            />
          </div>
          {/* ספרים */}
          <div>
            <label
              htmlFor="books"
              className="block text-lg mb-2 font-semibold text-amber-900"
            >
              ספרים (מופרדים בפסיקים)
            </label>
            <input
              type="text"
              id="books"
              name="books"
              defaultValue={tzadik.books?.join(", ") ?? ""}
              placeholder="הכנס שמות ספרים מופרדים בפסיקים"
              className="w-full px-4 py-2 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none transition placeholder-gray-500 text-gray-800 bg-amber-50"
            />
          </div>
          {/* מדינה */}
          <div>
            <label
              htmlFor="country"
              className="block text-lg mb-2 font-semibold text-amber-900"
            >
              מדינה
            </label>
            <input
              type="text"
              id="country"
              name="country"
              defaultValue={tzadik.country ?? ""}
              placeholder="הכנס מדינה"
              className="w-full px-4 py-2 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none transition placeholder-gray-500 text-gray-800 bg-amber-50"
            />
          </div>
          {/* עיר */}
          <div>
            <label
              htmlFor="city"
              className="block text-lg mb-2 font-semibold text-amber-900"
            >
              עיר
            </label>
            <input
              type="text"
              id="city"
              name="city"
              defaultValue={tzadik.city ?? ""}
              placeholder="הכנס עיר"
              className="w-full px-4 py-2 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none transition placeholder-gray-500 text-gray-800 bg-amber-50"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-700 to-amber-800 text-white py-3 rounded-xl font-bold text-lg shadow hover:from-amber-800 hover:to-amber-900 hover:scale-105 transition-all duration-200"
          >
            שמור שינויים
          </button>
        </form>
      </div>
    </div>
  );
}
