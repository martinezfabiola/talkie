async function processFile() {
    const imageInput = document.getElementById("imageInput");
    const audioInput = document.getElementById("audioInput");

    const imageFile = imageInput.files[0];
    const audioFile = audioInput.files[0];

    if (!imageFile || !audioFile) {
        alert("Please upload both an image and an audio file!");
        return;
    }

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });

    const imageBase64 = await toBase64(imageFile);
    const audioBase64 = await toBase64(audioFile);

    const payload = {
        data: [audioBase64, imageBase64]
    };

    try {
        const response = await fetch(
            "https://hf.space/embed/fabiolamp/wav2lip_fab_GPU/api/predict/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            }
        );

        const result = await response.json();

        // El video viene codificado en base64 en result.data[0]
        const videoBase64 = result.data[0].split(",")[1];
        const videoBlob = b64toBlob(videoBase64, "video/mp4");
        const videoUrl = URL.createObjectURL(videoBlob);

        document.getElementById("output").innerHTML = `
            <video controls autoplay>
                <source src="${videoUrl}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        `;
    } catch (error) {
        console.error(error);
        alert("Error al procesar el archivo.");
    }
}

// Función para convertir base64 a Blob
function b64toBlob(b64Data, contentType = '', sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
}
