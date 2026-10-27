/* ---------- Elements ---------- */
const translateForm = document.getElementById("translate-form")
const textInput = document.getElementById("text-input")
const translateBtn = document.getElementById("translate-btn")
const resetBtn = document.getElementById("reset-btn")
const originalText = document.getElementById("original-text")
const translationText = document.getElementById("translation-text")
const errorMsg = document.getElementById("error")
const formSection = document.getElementById("form-section")
const translationSection = document.getElementById("translation-section")

const sections = [formSection, translationSection]
const textareas = [textInput, originalText, translationText]

/* ---------- Messages ---------- */
const BUTTON_TEXT = { idle: "Translate", loading: "Translating..." }
const EMPTY_TEXT_MESSAGE = "Please type some text to translate."
const DEFAULT_ERROR_MESSAGE = "Sorry, something went wrong. Please try again in a moment."
const ERROR_MESSAGES = {
    400: "Your text is empty or too long (1,000 characters max).",
    429: "Too many requests. Please wait a minute and try again."
}

/* ---------- Events ---------- */
translateForm.addEventListener("submit", (e) => {
    e.preventDefault()
    translate()
})

resetBtn.addEventListener("click", resetApp)

textInput.addEventListener("input", () => autoResize(textInput))

window.addEventListener("resize", resizeVisibleTextareas)

/* ---------- Main flow ---------- */
async function translate() {
    errorMsg.textContent = ""

    const text = textInput.value.trim()
    if (!text) {
        errorMsg.textContent = EMPTY_TEXT_MESSAGE
        return
    }

    setLoading(true)

    try {
        const translation = await requestTranslation(text, getSelectedLang())
        renderTranslation(text, translation)
    } catch (err) {
        console.error(err)
        errorMsg.textContent = ERROR_MESSAGES[err.status] ?? DEFAULT_ERROR_MESSAGE
    } finally {
        setLoading(false)
    }
}

async function requestTranslation(text, lang) {
    const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang })
    })

    if (!response.ok) {
        const error = new Error(`Request failed: ${response.status}`)
        error.status = response.status
        throw error
    }

    const data = await response.json()
    return data.translation
}

function renderTranslation(original, translation) {
    originalText.value = original
    translationText.value = translation
    showSection(translationSection)
    resizeVisibleTextareas() // must run after the section is visible
}

function resetApp() {
    translateForm.reset() // clears the textarea and restores the default radio
    originalText.value = ""
    translationText.value = ""
    errorMsg.textContent = ""
    showSection(formSection)
    autoResize(textInput)
    textInput.focus()
}

/* ---------- Helpers ---------- */
function getSelectedLang() {
    return document.querySelector(`input[name="lang"]:checked`).value
}

function setLoading(isLoading) {
    translateBtn.disabled = isLoading
    translateBtn.textContent = isLoading ? BUTTON_TEXT.loading : BUTTON_TEXT.idle
}

function showSection(sectionToShow) {
    sections.forEach((section) => {
        section.classList.toggle("hidden", section !== sectionToShow)
    })
}

function autoResize(el) {
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
}

function resizeVisibleTextareas() {
    textareas.forEach((el) => {
        if (el.offsetParent !== null) autoResize(el) // hidden elements have no offsetParent
    })
}