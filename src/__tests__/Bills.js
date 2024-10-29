/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect'
import {fireEvent, screen, waitFor} from "@testing-library/dom"
import userEvent from "@testing-library/user-event";

import Bills from "../containers/Bills.js"
import BillsUI from "../views/BillsUI.js"

import {localStorageMock} from "../__mocks__/localStorage.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import mockStore from "../__mocks__/store"
jest.mock("../app/store", () => mockStore)
import {bills} from "../fixtures/bills.js"
import router from "../app/Router.js";


describe("Given I am connected as an employee", () => {
    //avant tous les tests, j'initialise le local storage simulé avec un utilisateur de type employee
    //je crée le root HTML de base sur lequel s'appuie le router 
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
    //après chaque test, je restaure les données simulées avec leurs valeurs initiales
    afterEach(() => {
        jest.restoreAllMocks()
    })

    describe("When I am on Bills Page", () => {
        test("Then bill icon window in vertical layout should be highlighted", async () => {
            window.onNavigate(ROUTES_PATH.Bills)
            await waitFor(() => screen.getByTestId('icon-window'))
            const windowIcon = screen.getByTestId('icon-window')
            expect(windowIcon.classList.contains('active-icon')).toBe(true)
        })

        test("Then bills should be ordered from earliest to latest", () => {
            document.body.innerHTML = BillsUI({data: bills})
            const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
            const antiChrono = (a, b) => ((a < b) ? 1 : -1)
            const datesSorted = [...dates].sort(antiChrono)
            expect(dates).toEqual(datesSorted)
        })

        describe('When I am on Bills page but it is loading', () => {
          test('Then, Loading page should be rendered', () => {
            document.body.innerHTML = BillsUI({ loading: true })
            expect(screen.getAllByText('Loading...')).toBeTruthy()
          })
        })
        
        describe('When I am on Bill page but back-end send an error message', () => {
          test('Then, Error page should be rendered', () => {
            document.body.innerHTML = BillsUI({ error: 'some error message' })
            expect(screen.getAllByText('Erreur')).toBeTruthy()
          })
        })

        test("When I click on logout button, I should be redirected to login page", () => {
          const logout = document.querySelector("#layout-disconnect");
          fireEvent.click(logout);
          expect(window.location.pathname).toBe(ROUTES_PATH.Login);
        });

        describe("When I click on buttonNewBill ", () => {
            test("Then it should call the eventlistener handleClickNewBill", () => {
                const onNavigate = (pathname) => {
                    document.body.innerHTML = ROUTES({
                        pathname
                    })
                }
                const billsInstance = new Bills({ document,onNavigate,store: null,localStorage})

                document.body.innerHTML = BillsUI({data: bills})

                const buttonNewBill = screen.getByTestId('btn-new-bill')
                const handleClickNewBill = jest.fn(billsInstance.handleClickNewBill)

                buttonNewBill.addEventListener('click', handleClickNewBill())

                userEvent.click(buttonNewBill)

                expect(handleClickNewBill).toHaveBeenCalledTimes(1);
                expect(handleClickNewBill).toHaveBeenCalledWith()
                expect(handleClickNewBill).toReturnTimes(1)
            })
            test("Then it should open the NewBills page ", () => {
                const onNavigate = (pathname) => {
                    document.body.innerHTML = ROUTES({
                        pathname
                    })
                }
                const billsInstance = new Bills({ document,onNavigate,store: null,localStorage})

                document.body.innerHTML = BillsUI({data: bills})

                const buttonNewBill = screen.getByTestId('btn-new-bill')
                const handleClickNewBill = jest.fn(billsInstance.handleClickNewBill)

                buttonNewBill.addEventListener('click', handleClickNewBill)

                userEvent.click(buttonNewBill)

                expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
            })
        })
    })

    describe("When I click on IconEye ", () => {
        //avant tous les tests, je simule la fonction modal de jQuery
        beforeAll(() => {
            jQuery.fn.modal = jest.fn()
        })
        test("Then it should call the eventlistener handleClickIconEye once", () => {
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({
                    pathname
                })
            }
            const billsInstance = new Bills({ document,onNavigate,store: null,localStorage})

                document.body.innerHTML = BillsUI({data: bills})

            const iconEye = screen.getAllByTestId('icon-eye')

            const handleClickIconEye = jest.fn(() => billsInstance.handleClickIconEye(iconEye[0]))

            iconEye.forEach(icon => {
                icon.addEventListener('click', handleClickIconEye)
            })

            userEvent.click(iconEye[0])

            expect(handleClickIconEye).toHaveBeenCalledTimes(1);
            expect(handleClickIconEye.mock.calls.length).toBe(1)
            expect(handleClickIconEye).toReturnTimes(1)
        })
        test("Then it should open the modale ", async () => {
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({
                    pathname
                })
            }
            const billInstance = new Bills({ document,onNavigate,store: null,localStorage})

            document.body.innerHTML = BillsUI({data: [bills[0]]})

            const iconEye = screen.getByTestId('icon-eye')
            const handleClickIconEye = jest.fn((icon) => billInstance.handleClickIconEye(icon)).
            mockImplementation((icon) => {
                const billUrl = 'https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a'
                const imgWidth = 755
                return `<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`
            })

            iconEye.addEventListener('click', (icon) => handleClickIconEye(icon))
            userEvent.click(iconEye)

            expect(screen.getAllByText("Justificatif")).toBeTruthy();
        })
    })

    
})

//test d'intégration GET
describe("When I navigate to Bills Page", () => {
    //avant tous les tests, j'espionne la fonction bills du mockstore
    //j'initialise le local storage simulé avec un utilisateur de type employee
    //je crée le root HTML de base sur lequel s'appui le router 
    beforeEach(() => {
        jest.spyOn(mockStore, "bills")
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
    afterEach(() => {
        jest.restoreAllMocks()
    })
    test("fetches bills from mock API GET", async () => {
        window.onNavigate(ROUTES_PATH.Bills)

        document.body.innerHTML = BillsUI({ data: bills })

        await waitFor(() => screen.getByText("Mes notes de frais"))
        const type = await waitFor(() => screen.getByText("Type"))
        const nom = await waitFor(() => screen.getByText("Nom"))
        const date = await waitFor(() => screen.getByText("Date"))
        const montant = await waitFor(() => screen.getByText("Montant"))
        const statut = await waitFor(() => screen.getByText("Statut"))
        const actions = await waitFor(() => screen.getByText("Actions"))

        expect(screen.getByText("Mes notes de frais")).toBeTruthy()
        expect(type).toBeTruthy()
        expect(nom).toBeTruthy()
        expect(date).toBeTruthy()
        expect(montant).toBeTruthy()
        expect(statut).toBeTruthy()
        expect(actions).toBeTruthy()

        const billsList = await mockStore.bills().list()
        expect(billsList.length).toBe(4)
        expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
    })
    describe("When an error occurs on API", () => {
        test("fetches bills from an API and fails with 404 message error", async () => {
            mockStore.bills.mockImplementationOnce(() => {
                return {
                    list: () => {
                        return Promise.reject(new Error("Erreur 404"))
                    }
                }
            })

            window.onNavigate(ROUTES_PATH.Bills)

            await new Promise(process.nextTick);
            const message = screen.getByText(/Erreur 404/)

            expect(message).toBeTruthy()
        })
        test("fetches messages from an API and fails with 500 message error", async () => {
            mockStore.bills.mockImplementationOnce(() => {
                return {
                    list: () => {
                        return Promise.reject(new Error("Erreur 500"))
                    }
                }
            })

            window.onNavigate(ROUTES_PATH.Bills)

            await new Promise(process.nextTick);
            const message = screen.getByText(/Erreur 500/)

            expect(message).toBeTruthy()
        })
    })
})