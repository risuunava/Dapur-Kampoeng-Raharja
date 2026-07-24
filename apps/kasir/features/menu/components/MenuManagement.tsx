"use client";

import { useState, useEffect } from "react";
import { getAllMenu, createMenu, updateMenu, deleteMenu, uploadMenuImage } from "../../../lib/api";
import type { Menu } from "@dapur-kampoeng/types";
import { formatRupiah, getLocalDateString } from "@dapur-kampoeng/utils";

interface MenuForm {
  name: string;
  price: string;
  category: string;
  date: string;
  status: "tersedia" | "habis";
  image_url: string;
}

function todayStr() {
  return getLocalDateString();
}

const emptyForm: MenuForm = {
  name: "",
  price: "",
  category: "",
  date: todayStr(),
  status: "tersedia",
  image_url: "",
};

export default function MenuManagement({ onBack }: { onBack: () => void }) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<null | "add" | "edit">(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MenuForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  async function fetchMenus() {
    setLoading(true);
    setError("");
    const result = await getAllMenu();
    if (result.error) {
      setError(result.error);
    } else {
      setMenus(result.data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchMenus();
  }, []);

  function openAdd() {
    setForm(emptyForm);
    setEditingId(null);
    setImageFile(null);
    setImagePreview("");
    setModal("add");
  }

  function openEdit(item: Menu) {
    setForm({
      name: item.name,
      price: String(item.price),
      category: item.category,
      date: item.date,
      status: item.status,
      image_url: item.image_url || "",
    });
    setEditingId(item.id);
    setImageFile(null);
    setImagePreview(item.image_url || "");
    setModal("edit");
  }

  function closeModal() {
    setModal(null);
    setEditingId(null);
  }

  async function handleSave() {
    if (!form.name || !form.price || !form.category || !form.date) {
      return;
    }
    setSaving(true);

    let imageUrl = form.image_url;
    if (imageFile) {
      const uploadResult = await uploadMenuImage(imageFile);
      if (uploadResult.error) {
        setError(uploadResult.error);
        setSaving(false);
        return;
      }
      imageUrl = uploadResult.data.url;
    }

    const payload = {
      name: form.name,
      price: Number(form.price),
      category: form.category,
      date: form.date,
      status: form.status,
      image_url: imageUrl || null,
    };

    let result;
    if (editingId) {
      result = await updateMenu(editingId, payload);
    } else {
      result = await createMenu(payload);
    }

    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    closeModal();
    fetchMenus();
  }

  async function handleDelete(id: string) {
    const result = await deleteMenu(id);
    if (result.error) {
      setError(result.error);
    }
    setDeleteConfirm(null);
    fetchMenus();
  }

  async function handleToggleStatus(item: Menu) {
    const newStatus = item.status === "tersedia" ? "habis" : "tersedia";
    const result = await updateMenu(item.id, { status: newStatus });
    if (result.error) {
      setError(result.error);
      return;
    }
    fetchMenus();
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between px-6 py-5 border-b border-line">
        <h2 className="text-2xl font-bold text-ink font-display">Manajemen Menu</h2>
        <button
          onClick={openAdd}
          className="px-4 py-2 rounded-sm bg-turmeric text-forest-dark font-semibold text-sm active:bg-turmeric-deep transition-colors duration-180"
        >
          + Tambah
        </button>
      </div>

      {error && (
        <div className="mx-4 mt-3 p-3 rounded-sm bg-chili/10 border border-chili/30">
          <p className="text-sm text-chili">{error}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading && <p className="text-center text-muted py-8">Memuat menu...</p>}

        {!loading && menus.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted mb-4">Belum ada menu. Tambah menu sekarang.</p>
            <button
              onClick={openAdd}
              className="px-6 py-3 rounded-sm bg-turmeric text-forest-dark font-semibold"
            >
              + Tambah Menu
            </button>
          </div>
        )}

        {!loading && menus.length > 0 && (
          <div className="space-y-2">
            {menus.map((item) => {
              const isHabis = item.status === "habis";
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 bg-surface rounded-sm p-3 border transition-colors duration-180 ${
                    isHabis ? "border-line/50 opacity-70" : "border-line"
                  }`}
                >
                  {item.image_url && (
                    <div className="w-12 h-12 rounded-sm overflow-hidden shrink-0 border border-line">
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink text-sm truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-forest" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {formatRupiah(item.price)}
                      </span>
                      <span className="text-[10px] text-muted bg-line/50 px-1.5 py-0.5 rounded">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted mt-0.5">
                      {item.date}
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(item)}
                    className={`px-2.5 py-1 rounded-sm text-[11px] font-semibold transition-colors duration-180 ${
                      isHabis
                        ? "bg-forest/10 text-forest active:bg-forest/20"
                        : "bg-chili/10 text-chili active:bg-chili/20"
                    }`}
                  >
                    {isHabis ? "Tersedia" : "Habis"}
                  </button>

                  <button
                    onClick={() => openEdit(item)}
                    className="px-2.5 py-1 rounded-sm text-[11px] font-semibold bg-surface text-muted border border-line active:bg-line transition-colors duration-180"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => setDeleteConfirm(item.id)}
                    className="px-2.5 py-1 rounded-sm text-[11px] font-semibold text-chili bg-chili/5 border border-chili/20 active:bg-chili/10 transition-colors duration-180"
                  >
                    Hapus
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Tambah/Edit */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-surface rounded-md w-full max-w-md border border-line p-6" style={{ boxShadow: "var(--shadow-card)" }}>
            <h3 className="font-semibold text-ink text-base mb-4" style={{ fontFamily: "var(--font-display)" }}>
              {editingId ? "Edit Menu" : "Tambah Menu"}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-muted mb-1">Nama Menu</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-sm border border-line bg-bg text-ink text-sm focus:outline-none focus:border-turmeric"
                  placeholder="Nasi Goreng"
                />
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">Harga (Rp)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-3 py-2 rounded-sm border border-line bg-bg text-ink text-sm focus:outline-none focus:border-turmeric"
                  placeholder="15000"
                />
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">Foto Menu</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 px-3 py-2 rounded-sm border border-line bg-bg text-sm text-muted cursor-pointer hover:border-turmeric transition-colors duration-180">
                    {imageFile ? imageFile.name : "Pilih Gambar"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImageFile(file);
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {(imagePreview || form.image_url) && (
                    <button
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                        setForm({ ...form, image_url: "" });
                      }}
                      className="text-xs text-chili shrink-0"
                    >
                      Hapus
                    </button>
                  )}
                </div>
                {(imagePreview || form.image_url) && (
                  <div className="mt-2 w-20 h-20 rounded-sm overflow-hidden border border-line">
                    <img
                      src={imagePreview || form.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">Kategori</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-sm border border-line bg-bg text-ink text-sm focus:outline-none focus:border-turmeric"
                  placeholder="Makanan"
                />
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">Tanggal</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-sm border border-line bg-bg text-ink text-sm focus:outline-none focus:border-turmeric"
                />
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">Status</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setForm({ ...form, status: "tersedia" })}
                    className={`flex-1 py-2 rounded-sm text-sm font-medium transition-colors duration-180 ${
                      form.status === "tersedia"
                        ? "bg-forest text-white"
                        : "bg-surface text-muted border border-line"
                    }`}
                  >
                    Tersedia
                  </button>
                  <button
                    onClick={() => setForm({ ...form, status: "habis" })}
                    className={`flex-1 py-2 rounded-sm text-sm font-medium transition-colors duration-180 ${
                      form.status === "habis"
                        ? "bg-chili text-white"
                        : "bg-surface text-muted border border-line"
                    }`}
                  >
                    Habis
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-sm border border-line text-muted font-medium text-sm active:bg-line transition-colors duration-180"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.price || !form.category || !form.date}
                className="flex-1 py-2.5 rounded-sm bg-turmeric text-forest-dark font-semibold text-sm disabled:opacity-50 transition-colors duration-180 active:bg-turmeric-deep"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Konfirmasi Hapus */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-surface rounded-md w-full max-w-xs border border-line p-6 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
            <p className="text-ink font-semibold mb-2">Hapus menu ini?</p>
            <p className="text-sm text-muted mb-6">Tindakan ini tidak bisa dibatalkan.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-sm border border-line text-muted font-medium text-sm active:bg-line transition-colors duration-180"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-sm bg-chili text-white font-semibold text-sm active:bg-chili/80 transition-colors duration-180"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
