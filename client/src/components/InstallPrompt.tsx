import { useEffect, useState } from "react";
import { Check, Download, X } from "lucide-react";

type InstallChoice = { outcome: "accepted" | "dismissed"; platform: string };
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
};

const dismissedKey = "lamsa-install-dismissed-until";

function getDismissedUntil() {
  try {
    return Number(localStorage.getItem(dismissedKey) || 0);
  } catch {
    return 0;
  }
}

function setDismissedUntil(value: number) {
  try {
    localStorage.setItem(dismissedKey, String(value));
  } catch {
    // Dismissal still applies for the current render if storage is unavailable.
  }
}

function isStandalone() {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

export default function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    const until = getDismissedUntil();
    const timer = window.setTimeout(() => {
      if (until < Date.now()) setVisible(true);
    }, 2600);

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setVisible(true);
    };
    const handleInstalled = () => {
      setInstalled(true);
      setVisible(false);
      setShowHelp(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const dismiss = () => {
    setDismissedUntil(Date.now() + 7 * 24 * 60 * 60 * 1000);
    setVisible(false);
    setShowHelp(false);
  };

  const install = async () => {
    if (!installEvent) {
      setShowHelp(true);
      return;
    }
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    setInstallEvent(null);
    if (choice.outcome === "accepted") {
      setInstalled(true);
      setVisible(false);
    } else {
      dismiss();
    }
  };

  if (installed || (!visible && !showHelp)) return null;

  return (
    <>
      {visible && (
        <aside className="install-invite" dir="rtl" aria-label="تثبيت تطبيق لمسة">
          <div className="install-invite-mark"><Download size={18} /></div>
          <div className="install-invite-copy">
            <strong>خلي لمسة أقرب لك</strong>
            <span>ثبّتي المتجر على جهازك لتصلي إليه بسرعة.</span>
          </div>
          <button className="install-cta" onClick={install}>
            تثبيت <Download size={15} />
          </button>
          <button className="install-dismiss" onClick={dismiss} aria-label="إغلاق">
            <X size={18} />
          </button>
        </aside>
      )}
      {showHelp && (
        <div className="modal-backdrop install-help-backdrop" onClick={dismiss}>
          <section className="install-help" dir="rtl" role="dialog" aria-modal="true" aria-labelledby="install-help-title" onClick={event => event.stopPropagation()}>
            <button className="icon-button modal-close" onClick={dismiss} aria-label="إغلاق"><X size={20} /></button>
            <div className="install-help-check"><Check size={22} /></div>
            <p className="eyebrow">لمسة على شاشتك الرئيسية</p>
            <h2 id="install-help-title">أضيفي لمسة إلى جهازك</h2>
            <p className="install-help-text">من قائمة المتصفح اختاري <b>تثبيت التطبيق</b> أو <b>إضافة إلى الشاشة الرئيسية</b>. تختلف التسمية بحسب نوع المتصفح والجهاز.</p>
            <button className="button-primary install-help-done" onClick={dismiss}>حسنًا</button>
          </section>
        </div>
      )}
    </>
  );
}
