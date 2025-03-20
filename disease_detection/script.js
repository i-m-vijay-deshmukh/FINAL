document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("imageUpload");
    const previewImage = document.getElementById("previewImage");
    const uploadContainer = document.getElementById("upload-container");
    const analyzeButton = document.getElementById("analyzeButton");
    const responseContainer = document.getElementById("disease-info");

    if (fileInput) {
        fileInput.addEventListener("change", function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function () {
                    previewImage.src = reader.result;
                    previewImage.style.display = "block";
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Define analyzeImage globally
    window.analyzeImage = async function () {
        if (!previewImage.src || previewImage.src === window.location.href) {
            alert("⚠️ Please upload an image first!");
            return;
        }

        // Hide Upload Section & Button
        if (uploadContainer) uploadContainer.style.display = "none";
        if (analyzeButton) analyzeButton.style.display = "none";

        // Ensure image stays centered
        previewImage.classList.add("centered-image");

        try {
            const apiKey = "AIzaSyB7JedGtsUDzQZ-w5cSdCeQQParNf7fgPc"; // Replace with actual API key
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const file = fileInput.files[0];
            const reader = new FileReader();

            reader.readAsDataURL(file);
            reader.onloadend = async function () {
                const base64Image = reader.result.split(',')[1];

                const requestData = {
                    contents: [
                        {
                            parts: [
                                { text: "🔍 Analyze this image for plant diseases and provide a clear diagnosis with symptoms, causes,solutions and pesticides to be used." },
                                {
                                    inline_data: {
                                        mime_type: file.type,
                                        data: base64Image
                                    }
                                }
                            ]
                        }
                    ]
                };

                const response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "❌ No response received.";

                let formattedResponse = aiResponse
                    .replace(/#/g, "")
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    .replace(/\*(.*?)\*/g, "<em>$1</em>")
                    .replace(/\n/g, "<br>");

                responseContainer.innerHTML = `
                    <h3 style="color: #2c3e50;">📖 <strong>AI Diagnosis & Solution</strong></h3>
                    <div class="response-box">${formattedResponse}</div>
                `;
            };
        } catch (error) {
            console.error("❌ Error analyzing image:", error);
            responseContainer.innerHTML = `
                <h3 style="color: red;">❌ Error: Could not retrieve disease information.</h3>
                <p>Please try again later.</p>
            `;
        }
    };

    if (analyzeButton) analyzeButton.addEventListener("click", analyzeImage);
});