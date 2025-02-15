// Codapi snippet tests.

import testing from "./testing.js";

const t = new testing.T("snippet");

async function runTests() {
    t.log("Running tests...");

    await testInit();
    await testInitDelay();

    await testAttachPrev();
    await testAttachParentPrev();
    await testAttachSelector();
    await testAttachSelectorPrev();

    await testRunnable();
    await testNotRunnable();

    await testEditorOff();
    await testEditorBasic();
    await testEditorExternal();

    await testEdit();
    await testRun();
    await testRunFailed();
    await testRunError();
    await testEditAndRun();

    await testEngineBrowser();
    await testEngineWasi();

    await testCustomStatus();
    await testCustomSandbox();
    await testCustomCommand();
    await testCustomEvent();

    await testFallbackOutput();
    await testFallbackOutputNext();
    await testFallbackOutputNextChild();
    await testFallbackOutputSelector();

    await testHideOutput();

    await testOutputLog();
    await testOutputReturn();
    await testOutputLogAndReturn();

    await testOutputModeDefault();
    await testOutputModeText();
    await testOutputModeTable();
    await testOutputModeSVG();
    await testOutputModeHTML();
    await testOutputModeIframe();
    await testOutputModeDOM();
    await testOutputModeHidden();

    await testOutputPlaceholder();
    await testOutputTailOff();
    await testOutputTailOn();
    await testOutputTailAuto();

    await testTemplate();
    await testTemplateChange();

    await testFilesSnippet();
    await testFilesScript();
    await testFilesPre();
    await testFilesTargetPath();

    await testDependsOn();
    await testDependsOrder1();
    await testDependsOrder2();

    t.summary();
    return t.errorCount;
}

async function testInit() {
    t.log("testInit...");
    const ui = createSnippet(`
        <pre><code>print("hello")</code></pre>
        <codapi-snippet sandbox="python" editor="basic"></codapi-snippet>
    `);
    t.assert("run button", ui.toolbar.innerHTML.includes("Run"));
    t.assert("edit button", ui.toolbar.innerHTML.includes("Edit"));
    t.assert("status", ui.status.innerHTML == "");
    t.assert("output", ui.output.hasAttribute("hidden"));
}

async function testInitDelay() {
    return new Promise((resolve, reject) => {
        t.log("testInitDelay...");
        const start = new Date();
        const snip = document.createElement("codapi-snippet");
        snip.setAttribute("sandbox", "python");
        snip.setAttribute("init-delay", "100");
        snip.addEventListener("load", () => {
            const elapsed = new Date() - start;
            t.assert("load", true);
            t.assert("init delay", elapsed >= 100);
            resolve();
        });
        const app = document.querySelector("#app");
        app.innerHTML = `<pre><code>print("hello")</code></pre>`;
        app.appendChild(snip);
    });
}

async function testAttachPrev() {
    t.log("testAttachPrev...");
    const ui = createSnippet(`
        <div>
            <div>print("hello")</div>
        </div>
        <codapi-snippet sandbox="python"></codapi-snippet>
    `);
    t.assertFunc("snippet code", () => {
        return ui.snip.code == `print("hello")`;
    });
}

async function testAttachParentPrev() {
    t.log("testAttachParentPrev...");
    const ui = createSnippet(`
        <div>
            <div>print("hello")</div>
        </div>
        <p>
            <codapi-snippet sandbox="python"></codapi-snippet>
        </p>
    `);
    t.assertFunc("snippet code", () => {
        return ui.snip.code == `print("hello")`;
    });
}

async function testAttachSelector() {
    t.log("testAttachSelector...");
    const ui = createSnippet(`
        <div id="playground">
            <pre class="code">print("hello")</pre>
        </div>
        <div>
            <codapi-snippet sandbox="python" selector="#playground .code"></codapi-snippet>
        </div>
    `);
    t.assertFunc("snippet code", () => {
        return ui.snip.code == `print("hello")`;
    });
}

async function testAttachSelectorPrev() {
    t.log("testAttachSelectorPrev...");
    const ui = createSnippet(`
        <div>
            <div>print("hello")</div>
        </div>
        <codapi-snippet sandbox="python" selector="@prev div"></codapi-snippet>
    `);
    t.assertFunc("snippet code", () => {
        return ui.snip.code == `print("hello")`;
    });
}

async function testEditorOff() {
    t.log("testEditorOff...");
    const ui = createSnippet(`
        <pre><code>print("hello")</code></pre>
        <codapi-snippet sandbox="python"></codapi-snippet>
    `);
    t.assert("editor", !ui.editor.hasAttribute("contenteditable"));
    t.assert("edit button", ui.toolbar.edit.hasAttribute("hidden"));
}

async function testEditorBasic() {
    t.log("testEditorBasic...");
    const ui = createSnippet(`
        <pre><code>print("hello")</code></pre>
        <codapi-snippet sandbox="python" editor="basic"></codapi-snippet>
    `);
    t.assert("editor", ui.editor.hasAttribute("contenteditable"));
    t.assert("edit button", !ui.toolbar.edit.hasAttribute("hidden"));
}

async function testEditorExternal() {
    t.log("testEditorExternal...");
    const ui = createSnippet(`
        <pre><code>print("hello")</code></pre>
        <codapi-snippet sandbox="python" editor="external"></codapi-snippet>
    `);
    t.assert("edit button", ui.toolbar.edit.hasAttribute("hidden"));
}

async function testEdit() {
    t.log("testEdit...");
    const ui = createSnippet(`
        <pre><code>print("hello")</code></pre>
        <codapi-snippet sandbox="python" editor="basic"></codapi-snippet>
    `);
    ui.toolbar.edit.click();
    t.assert("editor focus", document.activeElement == ui.editor);
}

async function testRun() {
    return new Promise((resolve, reject) => {
        t.log("testRun...");
        const ui = createSnippet(`
            <pre><code>print("hello")</code></pre>
            <codapi-snippet sandbox="python"></codapi-snippet>
        `);
        ui.snip.addEventListener("result", (event) => {
            const result = event.detail;
            t.assert("result.id", result.id.startsWith("python_run"));
            t.assert("result.ok", result.ok);
            t.assert("result.duration", result.duration > 0);
            t.assert("result.stdout", result.stdout.trim() == "hello");
            t.assert("result.stderr", result.stderr == "");
            t.assert("status done", ui.status.innerHTML.includes("Done"));
            t.assert("output", ui.output.out.innerText.trim() == "hello");
            resolve();
        });
        ui.snip.addEventListener("error", () => {
            t.assert("on error", false);
        });
        ui.toolbar.run.click();
        t.assert("status running", ui.status.innerHTML.includes("Running"));
    });
}

async function testRunFailed() {
    return new Promise((resolve, reject) => {
        t.log("testRunFailed...");
        const ui = createSnippet(`
            <pre><code>print("hello")</code></pre>
            <codapi-snippet sandbox="python"></codapi-snippet>
        `);
        const { executor } = ui.snip;
        t.mock(executor.engine, "exec", () => {
            return { ok: false, stdout: "", stderr: "syntax error" };
        });
        ui.snip.addEventListener("result", (event) => {
            const result = event.detail;
            t.assert("result.ok", !result.ok);
            t.assert("result.stdout", result.stdout == "");
            t.assert("result.stderr", result.stderr == "syntax error");
            t.assert("status done", ui.status.innerHTML.includes("Failed"));
            t.assert("output", ui.output.out.innerText.trim() == "syntax error");
            t.unmock(executor.engine, "exec");
            resolve();
        });
        ui.snip.addEventListener("error", () => {
            t.assert("on error", false);
        });
        ui.toolbar.run.click();
    });
}

async function testRunError() {
    return new Promise((resolve, reject) => {
        t.log("testRunError...");
        const ui = createSnippet(`
            <pre><code>print("hello")</code></pre>
            <codapi-snippet sandbox="python"></codapi-snippet>
        `);
        const { executor } = ui.snip;
        t.mock(executor.engine, "exec", () => {
            throw new Error("request failed");
        });
        ui.snip.addEventListener("result", () => {
            t.assert("on result", false);
        });
        ui.snip.addEventListener("error", (event) => {
            t.assert("error message", event.detail.message == "request failed");
            t.assert("status error", ui.status.innerHTML.includes("Failed"));
            t.assert("output", ui.output.out.innerText.trim() == "request failed");
            t.unmock(executor.engine, "exec");
            resolve();
        });
        ui.toolbar.run.click();
    });
}

async function testRunnable() {
    return new Promise((resolve, reject) => {
        t.log("testRunnable...");
        const ui = createSnippet(`
            <pre><code>print("hello")</code></pre>
            <codapi-snippet sandbox="python"></codapi-snippet>
        `);
        t.assert("runnable", ui.toolbar.runnable);
        t.assert("run button", !ui.toolbar.run.hasAttribute("hidden"));
        resolve();
    });
}

async function testNotRunnable() {
    return new Promise((resolve, reject) => {
        t.log("testNotRunnable...");
        const ui = createSnippet(`
            <pre><code>print("hello")</code></pre>
            <codapi-snippet></codapi-snippet>
        `);
        t.assert("runnable", !ui.toolbar.runnable);
        t.assert("run button", ui.toolbar.run.hasAttribute("hidden"));
        resolve();
    });
}

async function testEditAndRun() {
    return new Promise((resolve, reject) => {
        t.log("testEditAndRun...");
        const ui = createSnippet(`
            <pre><code>console.log("hello")</code></pre>
            <codapi-snippet engine="browser" sandbox="javascript"></codapi-snippet>
        `);
        ui.snip.addEventListener("result", (event) => {
            const result = event.detail;
            t.assert("result.ok", result.ok);
            t.assert("result.stdout", result.stdout.trim() == "goodbye");
            t.assert("result.stderr", result.stderr == "");
            t.assert("status done", ui.status.innerHTML.includes("Done"));
            t.assert("output", ui.output.out.innerText.trim() == "goodbye");
            resolve();
        });
        ui.editor.innerText = `console.log("goodbye")`;
        ui.toolbar.run.click();
        t.assert("status running", ui.status.innerHTML.includes("Running"));
    });
}

async function testEngineBrowser() {
    return new Promise((resolve, reject) => {
        t.log("testEngineBrowser...");
        const ui = createSnippet(`
            <pre><code>console.log("hello")</code></pre>
            <codapi-snippet engine="browser" sandbox="javascript"></codapi-snippet>
        `);
        ui.snip.addEventListener("result", (event) => {
            const result = event.detail;
            t.assert("result.ok", result.ok);
            t.assert("result.stdout", result.stdout.trim() == "hello");
            t.assert("result.stderr", result.stderr == "");
            t.assert("status done", ui.status.innerHTML.includes("Done"));
            t.assert("output", ui.output.out.innerText.trim() == "hello");
            resolve();
        });
        ui.snip.addEventListener("error", () => {
            t.assert("on error", false);
        });
        ui.toolbar.run.click();
        t.assert("status running", ui.status.innerHTML.includes("Running"));
    });
}

async function testEngineWasi() {
    // load wasi engine
    const wasi = document.createElement("script");
    wasi.setAttribute("type", "module");
    wasi.setAttribute("src", "../src/engine/runno.js");
    document.body.appendChild(wasi);
    await t.wait(50);

    // perform test
    return new Promise((resolve, reject) => {
        t.log("testEngineWasi...");
        const ui = createSnippet(`
            <pre><code>print("hello")</code></pre>
            <codapi-snippet engine="wasi" sandbox="lua"></codapi-snippet>
        `);
        ui.snip.addEventListener("result", (event) => {
            const result = event.detail;
            t.assert("result.ok", result.ok);
            t.assert("result.stdout", result.stdout.trim() == "hello");
            t.assert("result.stderr", result.stderr == "");
            t.assert("status done", ui.status.innerHTML.includes("Done"));
            t.assert("output", ui.output.out.innerText.trim() == "hello");
            resolve();
        });
        ui.snip.addEventListener("error", () => {
            t.assert("on error", false);
        });
        ui.toolbar.run.click();
        t.assert("status running", ui.status.innerHTML.includes("Running"));
    });
}

async function testCustomStatus() {
    return new Promise((resolve, reject) => {
        t.log("testCustomStatus...");
        const ui = createSnippet(`
            <pre><code>console.log("hello")</code></pre>
            <codapi-snippet
                engine="browser" sandbox="javascript"
                status-running="running!"
                status-failed="failed!"
                status-done="done!">
            </codapi-snippet>
        `);
        ui.snip.addEventListener("result", () => {
            t.assert("status done", ui.status.innerHTML.includes("done!"));
            resolve();
        });
        ui.toolbar.run.click();
        t.assert("status running", ui.status.innerHTML.includes("running!"));
    });
}

async function testCustomSandbox() {
    return new Promise((resolve, reject) => {
        t.log("testCustomSandbox...");
        const ui = createSnippet(`
            <pre><code>print("hello")</code></pre>
            <codapi-snippet engine="codapi" sandbox="python:dev"></codapi-snippet>
        `);
        const { executor } = ui.snip;
        t.mock(executor.engine, "exec", () => {
            t.assert("request sandbox", executor.sandbox == "python");
            t.assert("request version", executor.version == "dev");
            return { ok: true, stdout: "hello", stderr: "" };
        });
        ui.snip.addEventListener("result", (event) => {
            const result = event.detail;
            t.assert("result.ok", result.ok);
            t.unmock(executor.engine, "exec");
            resolve();
        });
        ui.toolbar.run.click();
    });
}

async function testCustomCommand() {
    return new Promise((resolve, reject) => {
        t.log("testCustomCommand...");
        const ui = createSnippet(`
            <pre><code>import unittest
class Test(unittest.TestCase):
    def test(self): pass</code></pre>
            <codapi-snippet sandbox="python" actions="Test:test"></codapi-snippet>
        `);
        ui.snip.addEventListener("result", (event) => {
            const result = event.detail;
            t.assert("result.ok", result.ok);
            t.assert("status done", ui.status.innerHTML.includes("Done"));
            resolve();
        });
        ui.toolbar.querySelector(`[href="#test"]`).click();
        t.assert("status running", ui.status.innerHTML.includes("Running"));
    });
}

async function testCustomEvent() {
    t.log("testCustomEvent...");
    const ui = createSnippet(`
        <pre><code>print("hello")</code></pre>
        <codapi-snippet sandbox="python" actions="Share:@share"></codapi-snippet>
    `);
    ui.snip.addEventListener("share", (event) => {
        const code = event.target.code;
        t.assert("code", code == `print("hello")`);
    });
    ui.toolbar.querySelector(`[href="#share"]`).click();
}

async function testFallbackOutput() {
    return new Promise((resolve, reject) => {
        t.log("testFallbackOutput...");
        const ui = createSnippet(`
            <pre><code>print("hello")</code></pre>
            <codapi-snippet sandbox="python" output></codapi-snippet>
            <pre>hello</pre>
        `);
        const { executor } = ui.snip;
        t.mock(executor.engine, "exec", () => {
            throw new Error("request failed");
        });
        ui.snip.addEventListener("error", (event) => {
            t.assert("error message", event.detail.message == "request failed");
            t.assert("status error", ui.status.innerHTML.includes("Failed, using fallback"));
            t.assert("output", ui.output.out.innerText.trim() == "hello");
            t.unmock(executor.engine, "exec");
            resolve();
        });
        ui.toolbar.run.click();
    });
}

async function testFallbackOutputNext() {
    return new Promise((resolve, reject) => {
        t.log("testFallbackOutputNext...");
        const ui = createSnippet(`
            <pre><code>print("hello")</code></pre>
            <codapi-snippet sandbox="python" output="@next"></codapi-snippet>
            <pre>hello</pre>
        `);
        const { executor } = ui.snip;
        t.mock(executor.engine, "exec", () => {
            throw new Error("request failed");
        });
        ui.snip.addEventListener("error", (event) => {
            t.assert("output", ui.output.out.innerText.trim() == "hello");
            t.unmock(executor.engine, "exec");
            resolve();
        });
        ui.toolbar.run.click();
    });
}

async function testFallbackOutputNextChild() {
    return new Promise((resolve, reject) => {
        t.log("testFallbackOutputNextChild...");
        const ui = createSnippet(`
            <pre><code>print("hello")</code></pre>
            <codapi-snippet sandbox="python" output="@next pre"></codapi-snippet>
            <div><pre>hello</pre></div>
        `);
        const { executor } = ui.snip;
        t.mock(executor.engine, "exec", () => {
            throw new Error("request failed");
        });
        ui.snip.addEventListener("error", (event) => {
            t.assert("output", ui.output.out.innerText.trim() == "hello");
            t.unmock(executor.engine, "exec");
            resolve();
        });
        ui.toolbar.run.click();
    });
}

async function testFallbackOutputSelector() {
    return new Promise((resolve, reject) => {
        t.log("testFallbackOutputSelector...");
        const ui = createSnippet(`
            <pre><code>print("hello")</code></pre>
            <codapi-snippet sandbox="python" output="#output"></codapi-snippet>
            <p>other element</p>
            <div><pre id="output">hello</pre></div>
        `);
        const { executor } = ui.snip;
        t.mock(executor.engine, "exec", () => {
            throw new Error("request failed");
        });
        ui.snip.addEventListener("error", (event) => {
            t.assert("output", ui.output.out.innerText.trim() == "hello");
            t.unmock(executor.engine, "exec");
            resolve();
        });
        ui.toolbar.run.click();
    });
}

async function testHideOutput() {
    return new Promise((resolve, reject) => {
        t.log("testHideOutput...");
        const ui = createSnippet(`
            <pre><code>const n = 42;</code></pre>
            <codapi-snippet engine="browser" sandbox="javascript"></codapi-snippet>
        `);
        ui.snip.addEventListener("result", () => {
            ui.output.close.click();
            t.assert("output hidden", ui.output.hasAttribute("hidden"));
            resolve();
        });
        ui.toolbar.run.click();
    });
}

async function testOutputLog() {
    return new Promise((resolve, reject) => {
        t.log("testOutputLog...");
        const ui = createSnippet(`
            <pre><code>console.log("hello")</code></pre>
            <codapi-snippet engine="browser" sandbox="javascript">
            </codapi-snippet>
        `);
        ui.snip.addEventListener("result", (event) => {
            t.assert("output", ui.output.out.innerHTML == "hello");
            resolve();
        });
        ui.toolbar.run.click();
    });
}

async function testOutputReturn() {
    return new Promise((resolve, reject) => {
        t.log("testOutputReturn...");
        const ui = createSnippet(`
            <pre><code>return "hello"</code></pre>
            <codapi-snippet engine="browser" sandbox="javascript">
            </codapi-snippet>
        `);
        ui.snip.addEventListener("result", (event) => {
            t.assert("output", ui.output.out.innerHTML == "hello");
            resolve();
        });
        ui.toolbar.run.click();
    });
}

async function testOutputLogAndReturn() {
    return new Promise((resolve, reject) => {
        t.log("testOutputLogAndReturn...");
        const ui = createSnippet(`
            <pre><code>console.log("hello"); return "goodbye";</code></pre>
            <codapi-snippet engine="browser" sandbox="javascript">
            </codapi-snippet>
        `);
        ui.snip.addEventListener("result", (event) => {
            t.assert("output", ui.output.out.innerHTML == "goodbye");
            resolve();
        });
        ui.toolbar.run.click();
    });
}

async function testOutputModeDefault() {
    return new Promise((resolve, reject) => {
        t.log("testOutputModeDefault...");
        const ui = createSnippet(`
            <pre><code>console.log("&lt;em&gt;hello&lt;/em&gt;")</code></pre>
            <codapi-snippet engine="browser" sandbox="javascript"></codapi-snippet>
        `);
        ui.snip.addEventListener("result", (event) => {
            const result = event.detail;
            t.assert("output", ui.output.out.innerHTML == "&lt;em&gt;hello&lt;/em&gt;");
            resolve();
        });
        ui.toolbar.run.click();
    });
}

async function testOutputModeText() {
    return new Promise((resolve, reject) => {
        t.log("testOutputModeText...");
        const ui = createSnippet(`
            <pre><code>console.log("&lt;em&gt;hello&lt;/em&gt;")</code></pre>
            <codapi-snippet engine="browser" sandbox="javascript" output-mode="text">
            </codapi-snippet>
        `);
        ui.snip.addEventListener("result", (event) => {
            t.assert("output", ui.output.out.innerHTML == "&lt;em&gt;hello&lt;/em&gt;");
            resolve();
        });
        ui.toolbar.run.click();
    });
}

async function testOutputModeTable() {
    return new Promise((resolve, reject) => {
        t.log("testOutputModeTable...");
        const ui = createSnippet(`
            <pre><code>console.log('[{"a":11},{"a":12}]')</code></pre>
            <codapi-snippet engine="browser" sandbox="javascript" output-mode="table">
            </codapi-snippet>
        `);
        ui.snip.addEventListener("result", (event) => {
            t.assert(
                "output",
                ui.output.out.innerHTML ==
                    "<table><thead><tr><th>a</th></tr></thead><tbody><tr><td>11</td></tr><tr><td>12</td></tr></tbody></table>"
            );
            resolve();
        });
        ui.toolbar.run.click();
    });
}

async function testOutputModeSVG() {
    return new Promise((resolve, reject) => {
        t.log("testOutputModeSVG...");
        const ui = createSnippet(`
            <pre><code>console.log("&lt;svg&gt;hello&lt;/svg&gt;")</code></pre>
            <codapi-snippet engine="browser" sandbox="javascript" output-mode="svg">
            </codapi-snippet>
        `);
        ui.snip.addEventListener("result", (event) => {
            t.assert("output", ui.output.out.innerHTML == "<svg>hello</svg>");
            resolve();
        });
        ui.toolbar.run.click();
    });
}

async function testOutputModeHTML() {
    return new Promise((resolve, reject) => {
        t.log("testOutputModeHTML...");
        const ui = createSnippet(`
            <pre><code>console.log("&lt;em&gt;hello&lt;/em&gt;")</code></pre>
            <codapi-snippet engine="browser" sandbox="javascript" output-mode="html">
            </codapi-snippet>
        `);
        ui.snip.addEventListener("result", (event) => {
            t.assert("output", ui.output.out.innerHTML == "<em>hello</em>");
            resolve();
        });
        ui.toolbar.run.click();
    });
}

async function testOutputModeIframe() {
    return new Promise((resolve, reject) => {
        t.log("testOutputModeIframe...");
        const ui = createSnippet(`
            <pre><code>console.log("&lt;html&gt;&lt;head&gt;&lt;/head&gt;&lt;body&gt;hello&lt;/body&gt;&lt;/html&gt;")</code></pre>
            <codapi-snippet engine="browser" sandbox="javascript" output-mode="iframe">
            </codapi-snippet>
        `);
        ui.snip.addEventListener("result", (event) => {
            t.assert("output iframe", ui.output.out.innerHTML.startsWith("<iframe"));
            t.assert("output body", ui.output.out.innerHTML.includes("<body>hello</body>"));
            resolve();
        });
        ui.toolbar.run.click();
    });
}

async function testOutputModeDOM() {
    return new Promise((resolve, reject) => {
        t.log("testOutputModeDOM...");
        const ui = createSnippet(`
            <pre><code>const el = document.createElement("em");
el.textContent = "hello";
return el;</code></pre>
            <codapi-snippet engine="browser" sandbox="javascript" output-mode="dom">
            </codapi-snippet>
        `);
        ui.snip.addEventListener("result", (event) => {
            t.assert("output", ui.output.out.innerHTML == "<em>hello</em>");
            resolve();
        });
        ui.toolbar.run.click();
    });
}

async function testOutputModeHidden() {
    return new Promise((resolve, reject) => {
        t.log("testOutputModeHidden...");
        const ui = createSnippet(`
            <pre><code>console.log("hello")</code></pre>
            <codapi-snippet engine="browser" sandbox="javascript" output-mode="hidden">
            </codapi-snippet>
        `);
        ui.snip.addEventListener("result", (event) => {
            t.assert("output empty", ui.output.out.innerHTML == "");
            t.assert("output hidden", ui.output.hasAttribute("hidden"));
            resolve();
        });
        ui.toolbar.run.click();
    });
}

async function testOutputPlaceholder() {
    return new Promise((resolve, reject) => {
        t.log("testOutputPlaceholder...");
        const ui = createSnippet(`
            <pre><code>const a = 42;</code></pre>
            <codapi-snippet engine="browser" sandbox="javascript" output-mode="text">
            </codapi-snippet>
        `);
        ui.snip.addEventListener("result", (event) => {
            t.assert("output", ui.output.out.innerHTML == "ok");
            resolve();
        });
        ui.toolbar.run.click();
    });
}

async function testOutputTailOff() {
    return new Promise((resolve, reject) => {
        t.log("testOutputTailOff...");
        const ui = createSnippet(`
            <pre><code>console.log("hello");
console.log("---");
console.log("world");</code></pre>
            <codapi-snippet engine="browser" sandbox="javascript" output-mode="text">
            </codapi-snippet>
        `);
        ui.snip.addEventListener("result", (event) => {
            t.assert("output", ui.output.out.innerHTML == "hello\n---\nworld");
            resolve();
        });
        ui.toolbar.run.click();
    });
}

async function testOutputTailOn() {
    return new Promise((resolve, reject) => {
        t.log("testOutputTailOn...");
        const ui = createSnippet(`
            <pre><code>console.log("hello");
console.log("---");
console.log("world");</code></pre>
            <codapi-snippet engine="browser" sandbox="javascript" output-mode="text" output-tail>
            </codapi-snippet>
        `);
        ui.snip.addEventListener("result", (event) => {
            t.assert("output", ui.output.out.innerHTML == "world");
            resolve();
        });
        ui.toolbar.run.click();
    });
}

async function testOutputTailAuto() {
    return new Promise((resolve, reject) => {
        t.log("testOutputTailAuto...");
        const html = `
            <pre><code>console.log("hello")</code></pre>
            <codapi-snippet id="step-1" engine="browser" sandbox="javascript">
            </codapi-snippet>
            <pre><code>console.log("world")</code></pre>
            <codapi-snippet engine="browser" sandbox="javascript" depends-on="step-1" output-tail>
            </codapi-snippet>
        `;
        const ui = createSnippet(html);
        ui.snip.addEventListener("result", (event) => {
            t.assert("output", ui.output.out.innerHTML == "world");
            resolve();
        });
        ui.toolbar.run.click();
    });
}

async function testTemplate() {
    return new Promise((resolve, reject) => {
        t.log("testTemplate...");
        const ui = createSnippet(`
<script id="template" type="text/plain">
function say(msg) {
    console.log(msg)
}
##CODE##
</script>
<pre><code>say("saying hello")</code></pre>
<codapi-snippet engine="browser" sandbox="javascript" template="#template">
</codapi-snippet>
        `);
        ui.snip.addEventListener("result", (event) => {
            const result = event.detail;
            t.assert("result.stdout", result.stdout.trim() == "saying hello");
            resolve();
        });
        ui.toolbar.run.click();
    });
}

async function testTemplateChange() {
    return new Promise((resolve, reject) => {
        t.log("testTemplateChange...");
        const ui = createSnippet(`
<script id="template-1" type="text/plain">console.log("first")</script>
<script id="template-2" type="text/plain">console.log("second")</script>
<pre><code>say("saying hello")</code></pre>
<codapi-snippet engine="browser" sandbox="javascript" template="#template-1">
</codapi-snippet>
        `);
        ui.snip.setAttribute("template", "#template-2");
        ui.snip.addEventListener("result", (event) => {
            const result = event.detail;
            t.assert("result.stdout", result.stdout.trim() == "second");
            resolve();
        });
        ui.toolbar.run.click();
    });
}

async function testFilesSnippet() {
    return new Promise((resolve, reject) => {
        t.log("testFilesSnippet...");
        const ui = createSnippet(`
<pre><code>
def say(msg):
    print(msg)
</code></pre>
<codapi-snippet id="talker.py" sandbox="python"></codapi-snippet>
<pre><code>
import talker
talker.say("saying hello")
</code></pre>
<codapi-snippet sandbox="python" files="#talker.py"></codapi-snippet>
        `);
        const { executor } = ui.snip;
        t.mock(executor.engine, "exec", (data) => {
            return { ok: true, stdout: "ok", stderr: "", request: data };
        });
        ui.snip.addEventListener("result", (event) => {
            const result = event.detail;
            t.assert(
                "talker.py",
                result.request.files["talker.py"] == "def say(msg):\n    print(msg)"
            );
            t.unmock(executor.engine, "exec");
            resolve();
        });
        ui.toolbar.run.click();
    });
}

async function testFilesScript() {
    return new Promise((resolve, reject) => {
        t.log("testFilesScript...");
        const ui = createSnippet(`
<script id="talker.py" type="text/plain">
def say(msg):
    print(msg)
</script>
<pre><code>
import talker
talker.say("saying hello")
</code></pre>
<codapi-snippet sandbox="python" files="#talker.py"></codapi-snippet>
        `);
        const { executor } = ui.snip;
        t.mock(executor.engine, "exec", (data) => {
            return { ok: true, stdout: "ok", stderr: "", request: data };
        });
        ui.snip.addEventListener("result", (event) => {
            const result = event.detail;
            t.assert(
                "talker.py",
                result.request.files["talker.py"] == "def say(msg):\n    print(msg)"
            );
            t.unmock(executor.engine, "exec");
            resolve();
        });
        ui.toolbar.run.click();
    });
}

async function testFilesPre() {
    return new Promise((resolve, reject) => {
        t.log("testFilesPre...");
        const ui = createSnippet(`
<pre id="talker.py"><code>
def say(msg):
    print(msg)
</code></pre>
<pre><code>
import talker
talker.say("saying hello")
</code></pre>
<codapi-snippet sandbox="python" files="#talker.py"></codapi-snippet>
        `);
        const { executor } = ui.snip;
        t.mock(executor.engine, "exec", (data) => {
            return { ok: true, stdout: "ok", stderr: "", request: data };
        });
        ui.snip.addEventListener("result", (event) => {
            const result = event.detail;
            t.assert(
                "talker.py",
                result.request.files["talker.py"] == "def say(msg):\n    print(msg)"
            );
            t.unmock(executor.engine, "exec");
            resolve();
        });
        ui.toolbar.run.click();
    });
}

async function testFilesTargetPath() {
    return new Promise((resolve, reject) => {
        t.log("testFilesTargetPath...");
        const ui = createSnippet(`
<script id="talker.py" type="text/plain">
def say(msg):
    print(msg)
</script>
<pre><code>
import chatty
chatty.say("saying hello")
</code></pre>
<codapi-snippet sandbox="python" files="#talker.py:chatty.py"></codapi-snippet>
        `);
        const { executor } = ui.snip;
        t.mock(executor.engine, "exec", (data) => {
            return { ok: true, stdout: "ok", stderr: "", request: data };
        });
        ui.snip.addEventListener("result", (event) => {
            const result = event.detail;
            t.assert(
                "chatty.py",
                result.request.files["chatty.py"] == "def say(msg):\n    print(msg)"
            );
            t.unmock(executor.engine, "exec");
            resolve();
        });
        ui.toolbar.run.click();
    });
}

async function testDependsOn() {
    return new Promise((resolve, reject) => {
        t.log("testDependsOn...");
        const html = `
            <pre><code>console.log("step-1")</code></pre>
            <codapi-snippet id="step-1" engine="browser" sandbox="javascript">
            </codapi-snippet>
            <pre><code>console.log("step-2")</code></pre>
            <codapi-snippet id="step-2" engine="browser" sandbox="javascript" depends-on="step-1">
            </codapi-snippet>
            <pre><code>console.log("step-3")</code></pre>
            <codapi-snippet id="step-3" engine="browser" sandbox="javascript" depends-on="step-2">
            </codapi-snippet>
        `;
        const ui = createSnippet(html);
        ui.snip.addEventListener("result", (event) => {
            const result = event.detail;
            t.assert("result.ok", result.ok);
            t.assert("result.stdout", result.stdout.trim() == "step-1\nstep-2\nstep-3");
            t.assert("result.stderr", result.stderr == "");
            t.assert("status done", ui.status.innerHTML.includes("Done"));
            t.assert("output", ui.output.out.innerText.trim() == "step-1\nstep-2\nstep-3");
            resolve();
        });
        ui.toolbar.run.click();
        t.assert("status running", ui.status.innerHTML.includes("Running"));
    });
}

async function testDependsOrder1() {
    return new Promise((resolve, reject) => {
        t.log("testDependsOrder1...");
        const html = `
            <pre><code>console.log("step-1")</code></pre>
            <codapi-snippet id="step-1" engine="browser" sandbox="javascript">
            </codapi-snippet>
            <pre><code>console.log("step-2")</code></pre>
            <codapi-snippet id="step-2" engine="browser" sandbox="javascript">
            </codapi-snippet>
            <pre><code>console.log("step-3")</code></pre>
            <codapi-snippet id="step-3" engine="browser" sandbox="javascript" depends-on="step-1 step-2">
            </codapi-snippet>
        `;
        const ui = createSnippet(html);
        ui.snip.addEventListener("result", (event) => {
            const result = event.detail;
            t.assert("result.ok", result.ok);
            t.assert("result.stdout", result.stdout.trim() == "step-1\nstep-2\nstep-3");
            t.assert("result.stderr", result.stderr == "");
            t.assert("status done", ui.status.innerHTML.includes("Done"));
            t.assert("output", ui.output.out.innerText.trim() == "step-1\nstep-2\nstep-3");
            resolve();
        });
        ui.toolbar.run.click();
        t.assert("status running", ui.status.innerHTML.includes("Running"));
    });
}

async function testDependsOrder2() {
    return new Promise((resolve, reject) => {
        t.log("testDependsOrder2...");
        const html = `
            <pre><code>console.log("step-1")</code></pre>
            <codapi-snippet id="step-1" engine="browser" sandbox="javascript">
            </codapi-snippet>
            <pre><code>console.log("step-2")</code></pre>
            <codapi-snippet id="step-2" engine="browser" sandbox="javascript" depends-on="step-1">
            </codapi-snippet>
            <pre><code>console.log("step-3")</code></pre>
            <codapi-snippet id="step-3" engine="browser" sandbox="javascript" depends-on="step-1">
            </codapi-snippet>
            <pre><code>console.log("step-4")</code></pre>
            <codapi-snippet id="step-4" engine="browser" sandbox="javascript" depends-on="step-2 step-3">
            </codapi-snippet>
        `;
        const ui = createSnippet(html);
        ui.snip.addEventListener("result", (event) => {
            const result = event.detail;
            t.assert("result.ok", result.ok);
            t.assert("result.stdout", result.stdout.trim() == "step-1\nstep-2\nstep-3\nstep-4");
            t.assert("result.stderr", result.stderr == "");
            t.assert("status done", ui.status.innerHTML.includes("Done"));
            t.assert("output", ui.output.out.innerText.trim() == "step-1\nstep-2\nstep-3\nstep-4");
            resolve();
        });
        ui.toolbar.run.click();
        t.assert("status running", ui.status.innerHTML.includes("Running"));
    });
}

function createSnippet(html) {
    document.querySelector("#app").innerHTML = html;
    const editor = document.querySelector("#app pre:last-of-type code");
    const snip = document.querySelector("#app codapi-snippet:last-of-type");
    const toolbar = snip.querySelector("codapi-toolbar");
    toolbar.run = toolbar.querySelector("button");
    toolbar.edit = toolbar.querySelector("a");
    const status = snip.querySelector("codapi-status");
    const output = snip.querySelector("codapi-output");
    output.out = output.querySelector("pre code");
    output.close = output.querySelector("a");
    return { editor, snip, toolbar, status, output };
}

export default { runTests };
