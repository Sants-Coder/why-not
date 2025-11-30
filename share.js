/*Compartilhamento Universal (com IMAGEM)*/

const canUseWebShare = navigator.share !== undefined;

/*Função: gerar File a partir da URL da imagem*/
async function loadImageAsFile(imageUrl) {
    try {
        const res = await fetch(imageUrl);
        const blob = await res.blob();

        const fileName = imageUrl.split("/").pop() || "share.png";

        return new File([blob], fileName, { type: blob.type });
    } catch (err) {
        console.warn("Falha ao carregar imagem:", err);
        return null;
    }
}

/*Compartilhar com Web Share API (com imagem opcional) */
async function handleShare(cardElement) {
    const text = cardElement.dataset.shareText || "";
    const title = cardElement.dataset.shareTitle || "Why Not?";
    const imageUrl = cardElement.dataset.shareImage || null;

    // Se houver imagem, converte em File
    let files = [];
    if (imageUrl) {
        const file = await loadImageAsFile(imageUrl);
        if (file) files.push(file);
    }

    const shareData = {
        title,
        text,
        files,
    };

    // Se suporta Web Share com arquivos
    if (navigator.canShare && navigator.canShare(shareData)) {
        try {
            await navigator.share(shareData);
            console.log("Compartilhado com sucesso!");
            return;
        } catch (err) {
            console.warn("Erro ao compartilhar:", err);
        }
    }

    // CASO NÃO SUPORTE arquivos → fallback
    openFallbackShare(text, imageUrl);
}

/*Fallback manual (WhatsApp, Telegram)*/
function openFallbackShare(text, imageUrl) {
    let extra = imageUrl ? `\nImagem: ${location.origin}/${imageUrl}` : "";
    const encoded = encodeURIComponent(`${text}\n${extra}`);

    const whats = `https://wa.me/?text=${encoded}`;
    const telegram = `https://t.me/share/url?url=${encoded}`;
    const twitter = `https://twitter.com/intent/tweet?text=${encoded}`;

    navigator.clipboard.writeText(`${text}\n${extra}`);

    alert(
        `📤 Compartilhar conteúdo:

WhatsApp: ${whats}
Telegram: ${telegram}
Twitter (X): ${twitter}

(O conteúdo foi copiado!)`
    );
}

/*detecta clique nos botões*/
document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".share-btn");
    if (!btn) return;

    const card = btn.closest("[data-share-text]");
    if (!card) {
        console.warn("Nenhum card com dados de compartilhamento encontrado.");
        return;
    }

    await handleShare(card);
});
