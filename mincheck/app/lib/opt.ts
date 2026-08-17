//cada valor de variable que devuelve el backend viene "etiquetado" — no es 5 directamente, es ["C_DATA", "0xADDR", "int", 5]

export type ValorOPT =
  | ["C_DATA", string, string, unknown]
  | ["C_STRUCT", string, string, ...[string, ValorOPT][]]
  | ["C_ARRAY", string, ...ValorOPT[]];

export type FrameOPT = {
  frame_id: string;
  func_name: string;
  line: number;
  is_highlighted: boolean;
  is_zombie: boolean;
  ordered_varnames: string[];
  encoded_locals: Record<string, ValorOPT>;
};

export type PasoOPT = {
  event: "step_line" | "call" | "return" | "uncaught_exception";
  func_name?: string;
  line: number;
  stdout: string;
  stack_to_render: FrameOPT[];
  heap: Record<string, ValorOPT>;
  globals: Record<string, ValorOPT>;
  ordered_globals: string[];
  exception_msg?: string;
};

export type TraceOPT = {
  code: string;
  trace: PasoOPT[];
};

export function formatearValorOPT(v: ValorOPT): string {
  const tag = v[0];
  if (tag === "C_DATA") {
    const val = v[3];
    return val === null ? "?" : String(val);
  }
  if (tag === "C_ARRAY") {
    const elementos = v.slice(2) as ValorOPT[];
    return "[" + elementos.map(formatearValorOPT).join(", ") + "]";
  }
  if (tag === "C_STRUCT") {
    const campos = v.slice(3) as [string, ValorOPT][];
    return "{" + campos.map(([k, val]) => `${k}: ${formatearValorOPT(val)}`).join(", ") + "}";
  }
  return "?";
}
