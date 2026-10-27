const textInput = document.getElementById("text-input")
const translateBtn = document.getElementById("translate-btn")
const resetBtn = document.getElementById("reset-btn")
const originalText = document.getElementById("original-text")
const translationText = document.getElementById("translation-text")
const errorMsg= document.getElementById("error")
const translationSection = document.getElementById("translation-section")
const formSection = document.getElementById("form-section")


translateBtn.addEventListener("click", function(e){
    e.preventDefault()
    translate()
})

resetBtn.addEventListener("click", (e)=>{
    e.preventDefault()
    textInput.value = ""
    originalText.value = ""
    translationText.value = ""
    errorMsg.textContent = ""
    document.querySelector(`input[name="lang"]`).checked = true
    translationSection.classList.add("hidden")
    formSection.classList.remove("hidden")
    textInput.focus()
})


async function translate (){
    errorMsg.textContent = ""
    const text = textInput.value.trim()
    if(!text){
        errorMsg.textContent = "Please type some text to translate."
        return
    }

    const selectedLang = document.querySelector(`input[name="lang"]:checked`).value

    translateBtn.disabled = true
    translateBtn.textContent = "Translating...."

   
    try{
        
        const response = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, lang: selectedLang })
        })

        if(!response.ok){
            throw new Error(`Request faild ${response.status}`)
        }
        const data = await response.json()
        renderTranslation(text, data.translation)
    }catch(err){
        console.error(err)
       errorMsg.textContent = "sorry try again in a moment"
    }finally{
        translateBtn.disabled = false
        translateBtn.textContent = "translate"
    }
}

function renderTranslation(orignal, translation){
    originalText.value= orignal
    translationText.value = translation
    formSection.classList.add("hidden")
    translationSection.classList.remove("hidden")
}