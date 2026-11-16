import React, { useMemo, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { Link2, Copy, MessageSquareHeart, Heart, ExternalLink } from 'lucide-react';
import { WEDDING, PREFIXES, Prefix, buildDisplayName } from '../config';

type Generated = { prefix: Prefix; name: string; displayName: string; link: string };

function buildLink(displayName: string) {
  return `${window.location.origin}/${encodeURIComponent(displayName)}`;
}

function buildMessage(displayName: string, link: string) {
  return `Dear ${displayName} ❤️

With joyful hearts, we warmly invite you to celebrate one of the most special days of our lives as we begin our journey together.

Please view our wedding invitation and all the event details through the link below 🌐:

${link}

Your presence would truly mean the world to us, and we would be honored to celebrate this beautiful moment together.

With love,
❤️ ${WEDDING.groomName} & ${WEDDING.brideName}`;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for non-secure contexts (e.g. opening the admin over a LAN IP)
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }
}

export function AdminPage() {
  const [prefix, setPrefix] = useState<Prefix>('Mr.');
  const [name, setName] = useState('');
  const [generated, setGenerated] = useState<Generated | null>(null);

  const isStale = !!generated && (generated.prefix !== prefix || generated.name !== name);
  const canCopy = !!generated && !isStale;
  const message = useMemo(
    () => (generated ? buildMessage(generated.displayName, generated.link) : ''),
    [generated],
  );

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const displayName = buildDisplayName(prefix, name);
    if (!displayName) {
      toast.error('Please enter a guest name');
      return;
    }
    setGenerated({ prefix, name, displayName, link: buildLink(displayName) });
  };

  const handleCopy = async (text: string, label: string) => {
    if (!canCopy) return;
    (await copyText(text)) ? toast.success(label) : toast.error('Could not copy — please copy manually');
  };

  const btnBase =
    'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-champagne via-brand-ivory to-white font-sans text-stone-800 px-4 py-10 sm:py-16">
      <Toaster position="top-center" richColors />

      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-10">
          <Heart className="w-6 h-6 mx-auto mb-4 text-brand-beige-deep fill-brand-beige/40" />
          <p className="text-[10px] uppercase tracking-[0.45em] text-brand-beige-deep font-semibold mb-3">
            Invitation Link Generator
          </p>
          <h1 className="font-display text-5xl sm:text-6xl text-stone-800">
            {WEDDING.groomName} & {WEDDING.brideName}
          </h1>
        </header>

        <form
          onSubmit={handleGenerate}
          className="bg-white/90 backdrop-blur rounded-3xl border border-brand-beige/40 shadow-[0_20px_50px_rgba(199,111,85,0.12)] p-6 sm:p-8"
        >
          <div className="grid sm:grid-cols-[180px_1fr] gap-4 sm:gap-5">
            <label className="block">
              <span className="block text-[10px] uppercase tracking-[0.25em] font-bold text-stone-500 mb-2 ml-1">
                Prefix
              </span>
              <select
                value={prefix}
                onChange={(e) => setPrefix(e.target.value as Prefix)}
                className="w-full rounded-2xl border border-brand-beige/50 bg-brand-ivory px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-beige-deep/40"
              >
                {PREFIXES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="block text-[10px] uppercase tracking-[0.25em] font-bold text-stone-500 mb-2 ml-1">
                Guest Name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sanjaya"
                autoComplete="off"
                className="w-full rounded-2xl border border-brand-beige/50 bg-brand-ivory px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-beige-deep/40"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button type="submit" className={`${btnBase} bg-brand-beige-deep text-white hover:bg-brand-mocha shadow-md`}>
              <Link2 className="w-4 h-4" /> Generate Link
            </button>
            <button
              type="button"
              disabled={!canCopy}
              onClick={() => generated && handleCopy(generated.link, 'Link copied!')}
              className={`${btnBase} border border-brand-beige-deep/50 text-brand-beige-deep bg-white hover:bg-brand-champagne`}
            >
              <Copy className="w-4 h-4" /> Copy Link Only
            </button>
            <button
              type="button"
              disabled={!canCopy}
              onClick={() => handleCopy(message, 'Message copied!')}
              className={`${btnBase} border border-brand-beige-deep/50 text-brand-beige-deep bg-white hover:bg-brand-champagne`}
            >
              <MessageSquareHeart className="w-4 h-4" /> Copy Full Message
            </button>
          </div>

          {isStale && (
            <p className="mt-4 text-sm text-brand-mocha">
              The details have changed. Click <strong>Generate Link</strong> again to update.
            </p>
          )}
        </form>

        {generated && (
          <section className={`mt-8 space-y-6 transition-opacity ${isStale ? 'opacity-50' : ''}`}>
            <div className="bg-white rounded-3xl border border-brand-beige/40 p-6 sm:p-8">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-500 mb-3">Generated Link</p>
              <div className="flex items-center gap-3 rounded-2xl bg-brand-ivory border border-brand-beige/40 px-4 py-3">
                <code className="flex-1 text-sm text-brand-mocha break-all">{generated.link}</code>
                <a
                  href={generated.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-beige-deep hover:text-brand-mocha flex-shrink-0"
                  title="Open invitation"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <p className="mt-4 text-sm text-stone-500 font-serif italic">
                On the invitation: “We cordially invite{' '}
                <span className="text-brand-beige-deep not-italic font-semibold">{generated.displayName}</span> to
                celebrate our special day with us.”
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-brand-beige/40 p-6 sm:p-8">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-500 mb-3">Message Preview</p>
              <pre className="whitespace-pre-wrap break-words font-sans text-[15px] leading-relaxed text-stone-700 bg-brand-ivory rounded-2xl border border-brand-beige/40 p-5">
                {message}
              </pre>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
