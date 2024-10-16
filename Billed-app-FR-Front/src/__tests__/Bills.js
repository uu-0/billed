/**
 * @jest-environment jsdom
 */
import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
    router()
  })

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains('active-icon')).toBe(true);
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("When I click on New Bill button, I should be redirected to NewBill page", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const form = document.createElement("form")
      form.setAttribute("data-testid", "form-new-bill");
      const input = document.createElement("input")
      input.setAttribute("data-testid", "file")
      document.body.append(form)
      document.body.append(input)
    
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
    
      const billsPage = new NewBill({
        document, onNavigate, store: null, localStorage: window.localStorage
      });
    
      const handleClickNewBill = jest.fn(billsPage.handleClickNewBill);
    
      const buttonNewBill = screen.getByTestId("btn-new-bill");
    
      buttonNewBill.addEventListener('click', handleClickNewBill);
      fireEvent.click(buttonNewBill);
    
      expect(handleClickNewBill).toHaveBeenCalled();
      expect(screen.getByTestId('form-new-bill')).toBeTruthy();
    });

    test("When I click on an eye icon, a modal should open displaying the bill", async () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const iconEye = screen.getAllByTestId("icon-eye")[0];
      const handleClickIconEye = jest.fn();
      iconEye.addEventListener("click", handleClickIconEye);
      fireEvent.click(iconEye);
    
      expect(handleClickIconEye).toHaveBeenCalled();
      const modal = screen.getByTestId('modaleFile');
      expect(modal).toBeTruthy();
    });

    test("When I click on logout button, I should be redirected to login page", () => {
      const logout = document.querySelector("#layout-disconnect");
      fireEvent.click(logout);
      expect(window.location.pathname).toBe(ROUTES_PATH.Login);
    });
    
    
  
    describe("When I navigate to Bills", () => {
      //test d'intégration GET
      test("fetches bills from mock API GET", async () => {
        window.onNavigate(ROUTES_PATH.Bills) 
        const tBody = await screen.getByTestId('tbody')
        expect(tBody).toBeTruthy()
      });
  
      //bloc de tests erreurs API
      describe("When an error occurs on API", () => {
          beforeEach(() => {
            jest.spyOn(mockStore, "bills");
          });
          //erreur 404
          test("fetches bills from an API and fails with 404 message error", async () => {
            mockStore.bills.mockImplementationOnce(() => {
              return {
                list: () => Promise.reject(new Error("Erreur 404")),
              };
            });
            window.onNavigate(ROUTES_PATH.Bills)
            await new Promise(process.nextTick);
            const message = await screen.getByText(/Erreur 404/);
            expect(message).toBeTruthy();
          });
          //erreur 500
          test("fetches bills from an API and fails with 500 message error", async () => {
            mockStore.bills.mockImplementationOnce(() => {
              return {
                list: () => Promise.reject(new Error("Erreur 500")),
              };
            });
            window.onNavigate(ROUTES_PATH.Bills)
            await new Promise(process.nextTick);
            const message = await screen.getByText(/Erreur 500/);
            expect(message).toBeTruthy();
          });
        });
    })
  })
})
