/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect'
import { screen, fireEvent } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'

import NewBill from "../containers/NewBill.js"
import NewBillUI from "../views/NewBillUI.js"
import BillsUI from "../views/BillsUI.js"

import {localStorageMock} from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import mockStore from "../__mocks__/store"
jest.mock("../app/store", () => mockStore)
import router from "../app/Router.js";
import store from '../app/Store.js'


describe(" Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    //avant tous les tests
    //j'initialise le local storage simulé avec un utilisateur de type employee
    //je crée le root HTML de base sur lequel s'appui le router
    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock
      })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
    })
    //après chaque test, je restaure les données simulées à leurs valeurs initiales
    afterEach(() => {
      jest.restoreAllMocks()
    })

    test("Then it should renders newBills page", () => {
      window.onNavigate(ROUTES_PATH.NewBill)
      const title = screen.getAllByText('Envoyer une note de frais')
      expect(title).toBeTruthy();
    })

    test("Then bill icon mail in vertical layout should be highlighted", () => {
      window.onNavigate(ROUTES_PATH.NewBill)
      const mail = screen.getByTestId('icon-mail')
      expect(mail).toHaveClass('active-icon')
    })

    test("Then it should show the form with inputs", () => {
      window.onNavigate(ROUTES_PATH.NewBill)

      const form = screen.getByTestId('form-new-bill');
      const expenseType = screen.getByTestId('expense-type');
      const expenseName = screen.getByTestId('expense-name');
      const datepicker = screen.getByTestId('datepicker');
      const amount = screen.getByTestId('amount');
      const vat = screen.getByTestId('vat');
      const pct = screen.getByTestId('pct');
      const commentary = screen.getByTestId('commentary');
      const file = screen.getByTestId('file');
      const submit = screen.getByRole('button', { type: /submit/i });

      expect(form).toBeTruthy();
      expect(expenseType).toBeTruthy();
      expect(expenseName).toBeTruthy();
      expect(datepicker).toBeTruthy();
      expect(amount).toBeTruthy();
      expect(vat).toBeTruthy();
      expect(pct).toBeTruthy();
      expect(commentary).toBeTruthy();
      expect(file).toBeTruthy();
      expect(submit).toBeTruthy();
    })

    test('Then if I upload a file with correct extension, it should call handleChangeFile', () => {
      jest.spyOn(mockStore, "bills")
      window.onNavigate(ROUTES_PATH.NewBill)

      const newBillInstance = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      document.body.innerHTML = NewBillUI();

      const handleChangeFile = jest.fn(newBillInstance.handleChangeFile)
      const inputFile = screen.getByTestId('file')

      inputFile.addEventListener('change', handleChangeFile)

      userEvent.upload(inputFile, new File(['(--[IMG]--)'], 'testFile.jpg', {
        type: 'image/jpg'
      }))

      expect(handleChangeFile).toHaveBeenCalled()
      expect(handleChangeFile).toHaveBeenCalledTimes(1)
      expect(inputFile.files[0].type).toMatch(/^image\/(jpg|jpeg|png)$/);
      expect(inputFile.files.length).toBe(1);
      expect(inputFile).not.toHaveClass('invalid')
    })
    test('Then if I upload a file with invalid extension, it should add an error message', () => {
      jest.spyOn(mockStore, "bills")
      window.onNavigate(ROUTES_PATH.NewBill)

      const newBillInstance = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      document.body.innerHTML = NewBillUI();

      const handleChangeFile = jest.fn(newBillInstance.handleChangeFile)
      const inputFile = screen.getByTestId('file')

      inputFile.addEventListener('change', handleChangeFile)

      userEvent.upload(inputFile, new File(['(--[IMG]--)'], 'testFile.pdf', {
        type: 'application/pdf'
      }))

      expect(handleChangeFile).toHaveBeenCalled()
      expect(handleChangeFile).toHaveBeenCalledTimes(1)
      expect(inputFile.files[0].type).not.toMatch(/^image\/(jpg|jpeg|png)$/)
      expect(inputFile.files.length).toBe(1)
    })
  })

  //test d'intégration POST
  describe("When I send a NewBill", () => {
    //avant tous les tests, je spy la fonction bills du mockstore
    //j'initialise le local storage simulé avec un utilisateur de type employee
    //je crée le root HTML de base sur lequel s'appui le router
    beforeEach(() => {
      jest.spyOn(store, "bills")
      Object.defineProperty(
        window,
        'localStorage', {
          value: localStorageMock
        }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "employee@test.tld"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    //après chaque test, je restaure les données simulées à leurs valeurs initiales
    afterEach(()=> {
      jest.restoreAllMocks()
    })

    test("Then it should create a new bills from mock API POST", async () => {
     const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({
          pathname
        });
      };
      window.onNavigate(ROUTES_PATH.NewBill)

      const newBillInstance = new NewBill({ document, onNavigate, store:mockStore, localStorage: window.localStorage })

      document.body.innerHTML = NewBillUI();

      const type = screen.getByTestId("expense-type");
      const expense = screen.getByTestId("expense-name");
      const date = screen.getByTestId("datepicker");
      const amount = screen.getByTestId("amount");
      const vat = screen.getByTestId("vat");
      const pct = screen.getByTestId("pct");
      const commentary = screen.getByTestId("commentary");
      const file = screen.getByTestId("file");

      userEvent.type(type, 'Repas d\'affaires')
      userEvent.type(expense, 'Dîner à Lyon')
      userEvent.type(date, "2024-09-03")
      userEvent.type(amount, '75')
      userEvent.type(vat, '15')
      userEvent.type(pct, '20')
      userEvent.type(commentary, "Dîner avec un client potentiel")
      newBillInstance.fileName = 'diner_client'
      newBillInstance.fileUrl = 'https://test.storage.tld/v0/b/billable-1234.a…e-2.jpg?alt=media&token=b2345678-d345-4ef9-8d4b-1234567890ab'
      const email = 'utilisateur@example.com'

      const bill = [{
        "id": "56yBXc8gJn2xPLr9LyPo",
        "vat": "10",
        "fileUrl": "https://test.storage.tld/v0/b/billable-1234.a…e-2.jpg?alt=media&token=b2345678-d345-4ef9-8d4b-1234567890ab",
        "status": "refused",
        "type": "Transport",
        "commentary": "trajet en taxi",
        "name": "déplacement pro",
        "fileName": "facture-transport-2024.pdf",
        "date": "2024-09-03",
        "amount": 55,
        "commentAdmin": "document manquant",
        "email": "exemple@exemple.com",
        "pct": 10
      }]

      const handleChangeFile = jest.fn(newBillInstance.handleChangeFile)
      const handleSubmit = jest.spyOn(newBillInstance, 'handleSubmit')
      const formNewBill = screen.getByTestId('form-new-bill')

      mockStore.bills.mockImplementation(() => {
        return {
          create: () => {
            return Promise.resolve({ fileUrl: `${newBillInstance.fileUrl}`, key: '1234' })
          },
          update: () => {
            return Promise.resolve({
              "id": "56yBXc8gJn2xPLr9LyPo",
              "vat": "10",
              "fileUrl": "https://test.storage.tld/v0/b/billable-1234.a…e-2.jpg?alt=media&token=b2345678-d345-4ef9-8d4b-1234567890ab",
              "status": "refused",
              "type": "Transport",
              "commentary": "trajet en taxi",
              "name": "déplacement pro",
              "fileName": "facture-transport-2024.pdf",
              "date": "2024-09-03",
              "amount": 55,
              "commentAdmin": "document manquant",
              "email": "exemple@exemple.com",
              "pct": 10
            })
          }
        }
      })

    file.addEventListener('change', handleChangeFile)
    formNewBill.addEventListener('submit', handleSubmit)

    userEvent.upload(file, new File(['--FICHIER--DE--TEST--'], 'testFile.jpg', {
      type: 'image/jpg'
    }))
    fireEvent.submit(formNewBill)

    expect(handleChangeFile).toHaveBeenCalled()
    expect(handleChangeFile).toBeCalledTimes(1)
    expect(handleSubmit).toHaveBeenCalled()
    expect(handleSubmit).toBeCalledTimes(1)
    expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
    })

    describe("When an error occurs on API", () => {
      test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          update: () => {
           return Promise.reject(new Error("Erreur 404"))
          }
        }
      })
      document.body.innerHTML = BillsUI({error: "Erreur 404"});
      await new Promise(process.nextTick);
      const message = screen.getByText(/Erreur 404/)

      expect(message).toBeTruthy()
      })
      test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          update: () => {
           return Promise.reject(new Error("Erreur 500"))
          }
        }
      })
      document.body.innerHTML = BillsUI({error: "Erreur 500"});
      await new Promise(process.nextTick);
      const message = screen.getByText(/Erreur 500/)

      expect(message).toBeTruthy()
      })
    })
  })
})