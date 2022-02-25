function unformattedContent(content: string): string {
    return content.split("---")[0].trim();
}

function formattedContent(content: string): string {
    return content.split("---")[1].trim();
}

export default {
    unformattedContent,
    formattedContent,
};
