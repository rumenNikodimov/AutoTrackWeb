import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import { createReminder } from "../services/reminders";
import {
  REMINDER_TYPE_OPTIONS,
  type ReminderType,
} from "../types/enums/ReminderType";
import type { Reminder, ReminderCreateRequest } from "../types/Reminder";

function getApiErrorMessage(err: unknown, fallback = "Request failed"): string {
  if (err && typeof err === "object") {
    const maybeError = err as {
      message?: unknown;
      response?: { data?: unknown };
    };

    const data = maybeError.response?.data;

    if (typeof data === "string" && data.trim()) {
      return data;
    }

    if (data && typeof data === "object") {
      const shaped = data as {
        title?: unknown;
        errors?: Record<string, unknown>;
      };

      if (shaped.errors && typeof shaped.errors === "object") {
        const messages = Object.values(shaped.errors)
          .flatMap((value) => {
            if (Array.isArray(value)) {
              return value.map((item) => String(item));
            }
            if (value == null) return [];
            return [String(value)];
          })
          .filter((message) => message.trim().length > 0);

        if (messages.length > 0) {
          return messages.join(" ");
        }
      }

      if (typeof shaped.title === "string" && shaped.title.trim()) {
        return shaped.title;
      }
    }

    if (typeof maybeError.message === "string" && maybeError.message.trim()) {
      return maybeError.message;
    }
  }

  return fallback;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

type Props = {
  open: boolean;
  vehicleId: number;
  onClose: () => void;
  onCreated?: (reminder: Reminder) => void;
};

export function CreateReminderModal({
  open,
  vehicleId,
  onClose,
  onCreated,
}: Props) {
  const { t } = useTranslation();

  const [form, setForm] = useState<ReminderCreateRequest>({
    vehicleId,
    reminderType: 0,
    title: "",
    description: "",
    dueDate: "",
    dueKm: undefined,
    notifyBeforeDays: undefined,
    notifyBeforeKm: undefined,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    const titleOk = form.title.trim().length > 0;
    const vehicleOk = Number.isFinite(vehicleId) && vehicleId > 0;
    const dueDateOk = typeof form.dueDate === "string" && form.dueDate.trim().length > 0;
    const dueKmOk = isFiniteNumber(form.dueKm) && form.dueKm >= 0;
    const notifyDaysOk = form.notifyBeforeDays == null || (isFiniteNumber(form.notifyBeforeDays) && form.notifyBeforeDays >= 0);
    const notifyKmOk = form.notifyBeforeKm == null || (isFiniteNumber(form.notifyBeforeKm) && form.notifyBeforeKm >= 0);

    return vehicleOk && titleOk && (dueDateOk || dueKmOk) && notifyDaysOk && notifyKmOk;
  }, [form, vehicleId]);

  if (!open) return null;

  const updateField = <K extends keyof ReminderCreateRequest>(
    key: K,
    value: ReminderCreateRequest[K]
  ) => {
    setForm((prev) => ({ ...prev, vehicleId, [key]: value }));
  };

  const resetForm = () => {
    setForm({
      vehicleId,
      reminderType: 0,
      title: "",
      description: "",
      dueDate: "",
      dueKm: undefined,
      notifyBeforeDays: undefined,
      notifyBeforeKm: undefined,
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const title = form.title.trim();
    const dueDateProvided = typeof form.dueDate === "string" && form.dueDate.trim().length > 0;
    const dueKmProvided = isFiniteNumber(form.dueKm) && form.dueKm >= 0;
    const notifyDaysProvided = form.notifyBeforeDays != null;
    const notifyKmProvided = form.notifyBeforeKm != null;

    if (!title || !Number.isFinite(vehicleId) || vehicleId <= 0 || (!dueDateProvided && !dueKmProvided)) {
      setError(t("reminderValidation"));
      return;
    }

    if (form.dueKm != null && !isFiniteNumber(form.dueKm)) {
      setError(t("reminderValidation"));
      return;
    }

    if (notifyDaysProvided && (!isFiniteNumber(form.notifyBeforeDays) || (form.notifyBeforeDays as number) < 0)) {
      setError(t("reminderValidation"));
      return;
    }

    if (notifyKmProvided && (!isFiniteNumber(form.notifyBeforeKm) || (form.notifyBeforeKm as number) < 0)) {
      setError(t("reminderValidation"));
      return;
    }

    try {
      setSubmitting(true);
      const payload: ReminderCreateRequest = {
        vehicleId,
        reminderType: form.reminderType as ReminderType,
        title,
        description: form.description?.trim() || undefined,
        dueDate: dueDateProvided ? form.dueDate : undefined,
        dueKm: dueKmProvided ? form.dueKm : undefined,
        notifyBeforeDays: notifyDaysProvided ? (form.notifyBeforeDays as number) : undefined,
        notifyBeforeKm: notifyKmProvided ? (form.notifyBeforeKm as number) : undefined,
      };

      const created = await createReminder(payload);
      onCreated?.(created);
      resetForm();
      onClose();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, t("reminderCreateFailed")));
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={headRow}>
          <h3 style={{ margin: 0 }}>{t("createReminder")}</h3>
          <button type="button" style={closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={submit}>
          <Field label={t("reminderType")}>
            <select
              value={String(form.reminderType)}
              onChange={(e) =>
                updateField("reminderType", Number(e.target.value) as ReminderType)
              }
              style={input}
            >
              {REMINDER_TYPE_OPTIONS.map((option) => (
                <option key={option.key} value={option.value}>
                  {t(option.key)}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t("title")}>
            <input
              style={input}
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
            />
          </Field>

          <Field label={t("description")}>
            <textarea
              style={{ ...input, minHeight: 72, resize: "vertical" }}
              value={form.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </Field>

          <div style={twoCol}>
            <Field label={t("dueDate")}>
              <input
                type="date"
                style={input}
                value={form.dueDate || ""}
                onChange={(e) => updateField("dueDate", e.target.value || undefined)}
              />
            </Field>

            <Field label={t("dueKm")}>
              <input
                type="number"
                style={input}
                value={form.dueKm ?? ""}
                onChange={(e) =>
                  updateField("dueKm", (() => {
                    if (e.target.value === "") return undefined;
                    const parsed = Number(e.target.value);
                    return Number.isFinite(parsed) ? parsed : undefined;
                  })())
                }
              />
            </Field>
          </div>

          <div style={twoCol}>
            <Field label={t("notifyBeforeDays")}>
              <input
                type="number"
                style={input}
                value={form.notifyBeforeDays ?? ""}
                onChange={(e) =>
                  updateField("notifyBeforeDays", (() => {
                    if (e.target.value === "") return undefined;
                    const parsed = Number(e.target.value);
                    return Number.isFinite(parsed) ? parsed : undefined;
                  })())
                }
              />
            </Field>

            <Field label={t("notifyBeforeKm")}>
              <input
                type="number"
                style={input}
                value={form.notifyBeforeKm ?? ""}
                onChange={(e) =>
                  updateField("notifyBeforeKm", (() => {
                    if (e.target.value === "") return undefined;
                    const parsed = Number(e.target.value);
                    return Number.isFinite(parsed) ? parsed : undefined;
                  })())
                }
              />
            </Field>
          </div>

          {error && <p style={errorText}>{error}</p>}

          <div style={actions}>
            <button type="button" style={cancelBtn} onClick={onClose}>
              {t("cancel")}
            </button>
            <button type="submit" style={saveBtn} disabled={submitting || !canSubmit}>
              {submitting ? t("saving") : t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={fieldWrap}>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  );
}

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 9999,
  background: "rgba(2,6,23,0.72)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 12,
};

const modal: React.CSSProperties = {
  width: "100%",
  maxWidth: 460,
  borderRadius: 18,
  border: "1px solid var(--ui-card-border)",
  background: "var(--ui-card-bg)",
  boxShadow: "0 22px 50px rgba(2,6,23,0.66)",
  padding: 14,
};

const headRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 10,
};

const closeBtn: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 10,
  border: "1px solid var(--ui-btn-border)",
  background: "var(--ui-btn-bg)",
  color: "var(--ui-btn-text)",
  cursor: "pointer",
  fontSize: 24,
  lineHeight: 1,
};

const fieldWrap: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  marginBottom: 10,
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--ui-text-muted)",
};

const input: React.CSSProperties = {
  width: "100%",
  minHeight: 42,
  padding: "8px 10px",
  borderRadius: 11,
  border: "1px solid var(--ui-btn-border)",
  background: "rgba(15,23,42,0.55)",
  color: "var(--ui-text-main)",
  fontSize: 14,
  boxSizing: "border-box",
};

const twoCol: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
};

const actions: React.CSSProperties = {
  display: "flex",
  gap: 8,
  marginTop: 4,
};

const btnBase: React.CSSProperties = {
  flex: 1,
  minHeight: 42,
  borderRadius: 12,
  fontWeight: 600,
  cursor: "pointer",
};

const cancelBtn: React.CSSProperties = {
  ...btnBase,
  border: "1px solid var(--ui-btn-border)",
  background: "var(--ui-btn-bg)",
  color: "var(--ui-btn-text)",
};

const saveBtn: React.CSSProperties = {
  ...btnBase,
  border: "none",
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  color: "white",
};

const errorText: React.CSSProperties = {
  margin: "4px 0 8px",
  color: "#fca5a5",
  fontSize: 13,
};
