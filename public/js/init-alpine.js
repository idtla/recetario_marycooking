window.Alpine = Alpine;

Alpine.data('data', () => ({
    dark: false,
    isSideMenuOpen: false,
    isNotificationsMenuOpen: false,
    isProfileMenuOpen: false,
    isPagesMenuOpen: false,
    isModalOpen: false,
    trapCleanup: null,
    toggleTheme() {
        this.dark = !this.dark;
    },
    toggleSideMenu() {
        this.isSideMenuOpen = !this.isSideMenuOpen;
    },
    closeSideMenu() {
        this.isSideMenuOpen = false;
    },
    toggleNotificationsMenu() {
        this.isNotificationsMenuOpen = !this.isNotificationsMenuOpen;
    },
    closeNotificationsMenu() {
        this.isNotificationsMenuOpen = false;
    },
    toggleProfileMenu() {
        this.isProfileMenuOpen = !this.isProfileMenuOpen;
    },
    closeProfileMenu() {
        this.isProfileMenuOpen = false;
    },
    togglePagesMenu() {
        this.isPagesMenuOpen = !this.isPagesMenuOpen;
    },
    // Modal
    openModal() {
        this.isModalOpen = true;
        this.trapCleanup = focusTrap(document.querySelector('#modal'));
    },
    closeModal() {
        this.isModalOpen = false;
        this.trapCleanup();
    },
}));
