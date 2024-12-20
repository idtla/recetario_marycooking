document.addEventListener('alpine:init', () => {
    Alpine.store('navigation', {
        isSideMenuOpen: false,
        isProfileMenuOpen: false,
        
        toggleSideMenu() {
            this.isSideMenuOpen = !this.isSideMenuOpen
        },
        
        closeSideMenu() {
            this.isSideMenuOpen = false
        },
        
        toggleProfileMenu() {
            this.isProfileMenuOpen = !this.isProfileMenuOpen
        },
        
        closeProfileMenu() {
            this.isProfileMenuOpen = false
        }
    })
});