onUiLoaded(function () {
    const buttons = document.querySelectorAll('#txt2img_extra_tabs .tab-nav button');
    buttons.forEach((button) => {
        if (button.textContent.trim().toLowerCase() === 'hypernetworks') {
            button.remove();
            console.log('[WebUI-Timer]: Hypernetworks tab removed :3');
        }
    });
});