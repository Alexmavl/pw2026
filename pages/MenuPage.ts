import { Page, Locator, expect } from '@playwright/test';

export class MenuPage {
    readonly page: Page;
    readonly burgerMenuButton: Locator;
    readonly logoutLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.burgerMenuButton = page.locator('#react-burger-menu-btn');
        this.logoutLink = page.locator('#logout_sidebar_link');
    }

    async logout() {
        await this.burgerMenuButton.click();
        await this.logoutLink.click();
        // Verifica que se regrese a la página base
        await expect(this.page).toHaveURL(/.*$/); 
    }
}