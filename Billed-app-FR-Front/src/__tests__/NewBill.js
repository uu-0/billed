/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH } from "../constants/routes.js"
import mockStore from "../__mocks__/store"
import { localStorageMock } from "../__mocks__/localStorage"
import router from "../app/Router"
import BillsUI from "../views/BillsUI.js"

//mock le store et le localStorage
jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    //simulation user dans le localStorage
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    
    //configuration routeur pour aller vers NewBill
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.appendChild(root)
    router()
    window.onNavigate(ROUTES_PATH.NewBill)
  })
  
  describe("When I am on NewBill Page", () => {
    test("Then the NewBill form should be rendered", () => {
      expect(screen.getByTestId("form-new-bill")).toBeTruthy()
    })

    test("Then, when I upload a file with the wrong format, it should show an alert", () => {
      window.alert = jest.fn();
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES_PATH.NewBill
      };
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage})
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      const file = new File(["content"], "test.txt", { type: "text/plain" });//file w wrong format
      const fileInput = screen.getByTestId("file")
      fileInput.addEventListener('change', handleChangeFile)
      fireEvent.change(fileInput, { target: { files: [file] } })
      expect(handleChangeFile).toHaveBeenCalled()
      expect(window.alert).toHaveBeenCalledWith('Le fichier doit être au format jpg, jpeg ou png.')
    })

    test("Then, when I submit the form with valid data, it should call updateBill", async () => {
      const newBill = new NewBill({ document, onNavigate: jest.fn(), store: mockStore, localStorage: window.localStorage })
      //mock de la méthode updateBill
      newBill.updateBill = jest.fn()
      //mock des données valides du formulaire
      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' })
      const inputFile = screen.getByTestId('file')
      fireEvent.change(inputFile, {
        target: {
          files: [file],
        },
      })
      //remplissage autres champs
      screen.getByTestId("expense-type").value = "Transports"
      screen.getByTestId("expense-name").value = "Train ticket"
      screen.getByTestId("amount").value = 50
      screen.getByTestId("datepicker").value = "2024-10-10"
      screen.getByTestId("vat").value = "20"
      screen.getByTestId("pct").value = "20"
      screen.getByTestId("commentary").value = "Business trip"

      expect(screen.getByTestId("expense-type").value).toBe("Transports")
      expect(screen.getByTestId("expense-name").value).toBe("Train ticket")
      expect(screen.getByTestId("amount").value).toBe("50")
      expect(screen.getByTestId("datepicker").value).toBe("2024-10-10")
      expect(screen.getByTestId("vat").value).toBe("20")
      expect(screen.getByTestId("pct").value).toBe("20")
      expect(screen.getByTestId("commentary").value).toBe("Business trip")
      
      //soumission du formulaire
      const form = screen.getByTestId("form-new-bill")
      const handleSubmit = jest.fn(newBill.handleSubmit)
      form.addEventListener("submit", handleSubmit)
      fireEvent.submit(form)

      expect(handleSubmit).toHaveBeenCalled()
      await waitFor(() => expect(newBill.updateBill).toHaveBeenCalled())
    })

  })

})


