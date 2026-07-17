import { expect, test } from "@playwright/test";

const windowByTitle = (page, title) =>
  page
    .locator(".window-frame")
    .filter({ has: page.locator(".window-title", { hasText: title }) });

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  // L'animation de bienvenue recouvre l'écran pendant 2 secondes.
  await expect(page.locator(".welcome-animation")).toHaveCount(0);
});

test("charge le bureau avec les fenêtres par défaut", async ({ page }) => {
  await expect(page).toHaveTitle("Milo Roche-Vandenbroucque");
  await expect(windowByTitle(page, "À propos de Milo")).toBeVisible();
  await expect(windowByTitle(page, "Terminal")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Milo Roche-Vandenbroucque" })
  ).toBeVisible();
});

test("ouvre puis ferme une application depuis le Dock", async ({ page }) => {
  await page.getByRole("button", { name: "Projets", exact: true }).click();
  const projectsWindow = windowByTitle(page, "Projets");
  await expect(projectsWindow).toBeVisible();
  await expect(
    projectsWindow.getByRole("heading", { name: "Projets" })
  ).toBeVisible();

  await projectsWindow
    .getByRole("button", { name: "Fermer la fenêtre" })
    .click();
  await expect(projectsWindow).toHaveCount(0);
});

test("déplace une fenêtre en la saisissant par sa barre de titre", async ({
  page,
}) => {
  const terminal = windowByTitle(page, "Terminal");
  const handle = terminal.locator(".menubar");
  const before = await terminal.boundingBox();

  // Vers la gauche : le Terminal s'ouvre près du bord droit du viewport.
  await handle.hover({ position: { x: 200, y: 15 } });
  await page.mouse.down();
  await page.mouse.move(before.x - 50, before.y + 95, { steps: 8 });
  await page.mouse.up();

  const after = await terminal.boundingBox();
  expect(before.x - after.x).toBeGreaterThan(50);
});

test("exécute une commande dans le Terminal", async ({ page }) => {
  const terminal = windowByTitle(page, "Terminal");
  const commandLine = terminal.getByLabel("Ligne de commande");

  await commandLine.click();
  await commandLine.fill("help");
  await commandLine.press("Enter");

  await expect(terminal.getByText("Commandes disponibles :")).toBeVisible();
});

test("joue au Démineur sans exploser au premier clic", async ({ page }) => {
  await page.getByRole("button", { name: "Jeux", exact: true }).click();
  const games = windowByTitle(page, "Jeux");
  await expect(games).toBeVisible();

  await games.locator(".mine-grid button").nth(40).click();
  await expect(
    games.getByRole("button", { name: "Partie en cours. Nouvelle partie" })
  ).toBeVisible();
});
