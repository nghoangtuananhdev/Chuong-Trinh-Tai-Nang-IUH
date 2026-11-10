import { Plus, Trash2 } from "lucide-react";
import { Button } from "./Button.jsx";
import { IconButton } from "./IconButton.jsx";
import { Field, Select } from "./Form.jsx";

const levels = { first: "Giải Nhất", second: "Giải Nhì", third: "Giải Ba", mention: "Giải Khuyến khích" };

export function AwardFields({ awards = [], onChange }) {
  return <fieldset className="space-y-3">
    <legend className="ui-label">Giải thưởng chuyên ngành</legend>
    <p className="text-body-sm text-ink-600">Thêm từng giải và đính kèm giấy chứng nhận trong hồ sơ minh chứng.</p>
    {awards.map((award, index) => (
      <div key={index} className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <Field label={`Giải thưởng ${index + 1}`} required>
            <Select value={award} onChange={(event) => onChange(awards.map((item, position) => position === index ? event.target.value : item))}>
              <option value="" disabled>Chọn mức giải</option>
              {Object.entries(levels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
          </Field>
        </div>
        <IconButton icon={Trash2} label={`Xóa giải thưởng ${index + 1}`} variant="danger" onClick={() => onChange(awards.filter((_, position) => position !== index))} />
      </div>
    ))}
    <Button variant="secondary" size="sm" icon={Plus} onClick={() => onChange([...awards, ""])}>Thêm giải thưởng</Button>
  </fieldset>;
}
