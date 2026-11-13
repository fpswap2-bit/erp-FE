import { useEffect, useRef } from "react";

const vertexSource = `
  attribute vec4 a_position;
  void main() { gl_Position = a_position; }
`;

const fragmentSource = `
precision mediump float;

uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;
uniform vec3 u_color;

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 centeredUV = (2.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);
    float time = iTime * 0.5;

    vec2 mouse = iMouse / iResolution;
    vec2 rippleCenter = 2.0 * mouse - 1.0;

    vec2 distortion = centeredUV;
    for (float i = 1.0; i < 8.0; i++) {
        distortion.x += 0.5 / i * cos(i * 2.0 * distortion.y + time + rippleCenter.x * 3.1415);
        distortion.y += 0.5 / i * cos(i * 2.0 * distortion.x + time + rippleCenter.y * 3.1415);
    }

    float wave = abs(sin(distortion.x + distortion.y + time));
    float glow = smoothstep(0.9, 0.2, wave);
    fragColor = vec4(u_color * glow, 1.0);
}

void main() { mainImage(gl_FragColor, gl_FragCoord.xy); }
`;

type BlurSize = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

const blurClassMap: Record<BlurSize, string> = {
    none: "backdrop-blur-none",
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
    "2xl": "backdrop-blur-2xl",
    "3xl": "backdrop-blur-3xl",
};

interface SmokeyBackgroundProps {
    backdropBlurAmount?: BlurSize;
    color?: string; // hex, e.g. "#1E40AF"
    className?: string;
}

const hexToRgb = (hex: string): [number, number, number] => [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
];

export function SmokeyBackground({
    backdropBlurAmount = "sm",
    color = "#1E40AF",
    className = "",
}: SmokeyBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouse = useRef({ x: 0, y: 0, active: false });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext("webgl");
        if (!gl) {
            console.error("WebGL not supported");
            return;
        }

        const compile = (type: number, source: string) => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error("Shader error:", gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const vs = compile(gl.VERTEX_SHADER, vertexSource);
        const fs = compile(gl.FRAGMENT_SHADER, fragmentSource);
        const program = gl.createProgram();
        if (!vs || !fs || !program) return;

        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Program link error:", gl.getProgramInfoLog(program));
            return;
        }
        gl.useProgram(program);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
            gl.STATIC_DRAW
        );

        const posLoc = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        const uRes = gl.getUniformLocation(program, "iResolution");
        const uTime = gl.getUniformLocation(program, "iTime");
        const uMouse = gl.getUniformLocation(program, "iMouse");
        const uColor = gl.getUniformLocation(program, "u_color");

        const [r, g, b] = hexToRgb(color);
        gl.uniform3f(uColor, r, g, b);

        const start = performance.now();
        let raf = 0;

        const render = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
            const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));

            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
                gl.viewport(0, 0, w, h);
            }

            const m = mouse.current;
            gl.uniform2f(uRes, w, h);
            gl.uniform1f(uTime, (performance.now() - start) / 1000);
            gl.uniform2f(
                uMouse,
                m.active ? m.x * dpr : w / 2,
                m.active ? h - m.y * dpr : h / 2
            );

            gl.drawArrays(gl.TRIANGLES, 0, 6);
            raf = requestAnimationFrame(render);
        };

        // window, not canvas: the blur overlay and the login card sit above the canvas
        const onMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
        };
        const onLeave = () => (mouse.current.active = false);

        window.addEventListener("mousemove", onMove);
        document.addEventListener("mouseleave", onLeave);
        render();

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseleave", onLeave);
            gl.deleteProgram(program);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
            gl.deleteBuffer(buffer);
        };
    }, [color]);

    return (
        <div className={`absolute inset-0 h-full w-full overflow-hidden ${className}`}>
            <canvas ref={canvasRef} className="h-full w-full" />
            <div
                className={`pointer-events-none absolute inset-0 ${
                    blurClassMap[backdropBlurAmount] ?? blurClassMap.sm
                }`}
            />
        </div>
    );
}