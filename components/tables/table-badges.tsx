import type { CSSProperties } from "react";
import { ArrowDownRight, ArrowUpRight } from "@phosphor-icons/react";
import { cn, formatPct } from "@/lib/utils";

const anthropicLogo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 257"><path fill="#D97757" d="m50.228 170.321 50.357-28.257.843-2.463-.843-1.361h-2.462l-8.426-.518-28.775-.778-24.952-1.037-24.175-1.296-6.092-1.297L0 125.796l.583-3.759 5.12-3.434 7.324.648 16.202 1.101 24.304 1.685 17.629 1.037 26.118 2.722h4.148l.583-1.685-1.426-1.037-1.101-1.037-25.147-17.045-27.22-18.017-14.258-10.37-7.713-5.25-3.888-4.925-1.685-10.758 7-7.713 9.397.649 2.398.648 9.527 7.323 20.35 15.75L94.817 91.9l3.889 3.24 1.555-1.102.195-.777-1.75-2.917-14.453-26.118-15.425-26.572-6.87-11.018-1.814-6.61c-.648-2.723-1.102-4.991-1.102-7.778l7.972-10.823L71.42 0 82.05 1.426l4.472 3.888 6.61 15.101 10.694 23.786 16.591 32.34 4.861 9.592 2.592 8.879.973 2.722h1.685v-1.556l1.36-18.211 2.528-22.36 2.463-28.776.843-8.1 4.018-9.722 7.971-5.25 6.222 2.981 5.12 7.324-.713 4.73-3.046 19.768-5.962 30.98-3.889 20.739h2.268l2.593-2.593 10.499-13.934 17.628-22.036 7.778-8.749 9.073-9.657 5.833-4.601h11.018l8.1 12.055-3.628 12.443-11.342 14.388-9.398 12.184-13.48 18.147-8.426 14.518.778 1.166 2.01-.194 30.46-6.481 16.462-2.982 19.637-3.37 8.88 4.148.971 4.213-3.5 8.62-20.998 5.184-24.628 4.926-36.682 8.685-.454.324.519.648 16.526 1.555 7.065.389h17.304l32.21 2.398 8.426 5.574 5.055 6.805-.843 5.184-12.962 6.611-17.498-4.148-40.83-9.721-14-3.5h-1.944v1.167l11.666 11.406 21.387 19.314 26.767 24.887 1.36 6.157-3.434 4.86-3.63-.518-23.526-17.693-9.073-7.972-20.545-17.304h-1.36v1.814l4.73 6.935 25.017 37.59 1.296 11.536-1.814 3.76-6.481 2.268-7.13-1.297-14.647-20.544-15.1-23.138-12.185-20.739-1.49.843-7.194 77.448-3.37 3.953-7.778 2.981-6.48-4.925-3.436-7.972 3.435-15.749 4.148-20.544 3.37-16.333 3.046-20.285 1.815-6.74-.13-.454-1.49.194-15.295 20.999-23.267 31.433-18.406 19.702-4.407 1.75-7.648-3.954.713-7.064 4.277-6.286 25.47-32.405 15.36-20.092 9.917-11.6-.065-1.686h-.583L44.07 198.125l-12.055 1.555-5.185-4.86.648-7.972 2.463-2.593 20.35-13.999-.064.065Z"/></svg>`;

const gptLogo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 260"><path fill="#fff" d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z"></path></svg>`;

const geminiLogo = `<svg viewBox="0 0 296 298" xmlns="http://www.w3.org/2000/svg" fill="none"><mask id="gemini-a" width="296" height="298" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path fill="#3186FF" d="M141.201 4.886c2.282-6.17 11.042-6.071 13.184.148l5.985 17.37a184.004 184.004 0 0 0 111.257 113.049l19.304 6.997c6.143 2.227 6.156 10.91.02 13.155l-19.35 7.082a184.001 184.001 0 0 0-109.495 109.385l-7.573 20.629c-2.241 6.105-10.869 6.121-13.133.025l-7.908-21.296a184 184 0 0 0-109.02-108.658l-19.698-7.239c-6.102-2.243-6.118-10.867-.025-13.132l20.083-7.467A183.998 183.998 0 0 0 133.291 26.28l7.91-21.394Z"/></mask><g mask="url(#gemini-a)"><g filter="url(#gemini-b)"><ellipse cx="163" cy="149" fill="#3689FF" rx="196" ry="159"/></g><g filter="url(#gemini-c)"><ellipse cx="33.5" cy="142.5" fill="#F6C013" rx="68.5" ry="72.5"/></g><g filter="url(#gemini-d)"><ellipse cx="19.5" cy="148.5" fill="#F6C013" rx="68.5" ry="72.5"/></g><g filter="url(#gemini-e)"><path fill="#FA4340" d="M194 10.5C172 82.5 65.5 134.333 22.5 135L144-66l50 76.5Z"/></g><g filter="url(#gemini-f)"><path fill="#FA4340" d="M190.5-12.5C168.5 59.5 62 111.333 19 112L140.5-89l50 76.5Z"/></g><g filter="url(#gemini-g)"><path fill="#14BB69" d="M194.5 279.5C172.5 207.5 66 155.667 23 155l121.5 201 50-76.5Z"/></g><g filter="url(#gemini-h)"><path fill="#14BB69" d="M196.5 320.5C174.5 248.5 68 196.667 25 196l121.5 201 50-76.5Z"/></g></g><defs><filter id="gemini-b" width="464" height="390" x="-69" y="-46" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_69_17998" stdDeviation="18"/></filter><filter id="gemini-c" width="265" height="273" x="-99" y="6" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_69_17998" stdDeviation="32"/></filter><filter id="gemini-d" width="265" height="273" x="-113" y="12" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_69_17998" stdDeviation="32"/></filter><filter id="gemini-e" width="299.5" height="329" x="-41.5" y="-130" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_69_17998" stdDeviation="32"/></filter><filter id="gemini-f" width="299.5" height="329" x="-45" y="-153" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_69_17998" stdDeviation="32"/></filter><filter id="gemini-g" width="299.5" height="329" x="-41" y="91" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_69_17998" stdDeviation="32"/></filter><filter id="gemini-h" width="299.5" height="329" x="-39" y="132" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_69_17998" stdDeviation="32"/></filter></defs></svg>`;

const kimiLogo = `<svg viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" fill="none"><path d="M10.9224 0C11.1774 0 11.422 0.101301 11.6023 0.281617C11.7826 0.461933 11.8839 0.706494 11.8839 0.9615C11.8839 1.21651 11.7826 1.46107 11.6023 1.64138C11.422 1.8217 11.1774 1.923 10.9224 1.923H10.0744C10.0596 1.92307 10.0448 1.92019 10.031 1.91454C10.0173 1.90889 10.0048 1.90058 9.99421 1.89008C9.98367 1.87958 9.9753 1.8671 9.96959 1.85336C9.96388 1.83962 9.96094 1.82488 9.96094 1.81V0.9615C9.96094 0.4305 10.3914 0 10.9224 0Z" fill="#1783FF"/><path d="M5.5325 5.59943L9.161 1.99943C9.2295 1.93143 9.191 1.79443 9.103 1.79443H7.15C7.13904 1.79456 7.12822 1.79688 7.11817 1.80126C7.10812 1.80564 7.09905 1.81199 7.0915 1.81993L3.1815 5.69793C3.1205 5.75793 3.0305 5.70443 3.0305 5.60843V1.90993C3.0305 1.84643 2.989 1.79493 2.938 1.79493H1.593C1.5415 1.79493 1.5 1.84643 1.5 1.90993V9.88493C1.5 9.94893 1.5415 9.99993 1.593 9.99993H2.938C2.9895 9.99993 3.031 9.94893 3.031 9.88493V8.25993C3.031 8.22543 3.0435 8.19243 3.0655 8.17093L4.2775 6.96793C4.29037 6.95405 4.3078 6.94526 4.32661 6.94315C4.34543 6.94104 4.36437 6.94575 4.38 6.95643L7.622 9.34243C8.13691 9.69322 8.72947 9.91339 9.3485 9.98393C9.4025 9.98993 9.4485 9.93643 9.4485 9.86893V8.33893C9.4485 8.28043 9.4135 8.23293 9.3665 8.22543C9.00321 8.16673 8.65723 8.02899 8.353 7.82193L5.5465 5.78993C5.488 5.75093 5.4805 5.65043 5.5325 5.59943Z" fill="#fff"/></svg>`;

const deepseekLogo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#4D6BFE" d="M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 0 1-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 0 0-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 0 1-.465.137 9.597 9.597 0 0 0-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 0 0 1.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 0 1 1.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 0 1 .415-.287.302.302 0 0 1 .2.288.306.306 0 0 1-.31.307.303.303 0 0 1-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 0 1-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 0 1 .016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 0 1-.254-.078.253.253 0 0 1-.114-.358c.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z"/></svg>`;

const qwenLogo = `<svg fill="currentColor" fill-rule="evenodd" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.604 1.34c.393.69.784 1.382 1.174 2.075a.18.18 0 00.157.091h5.552c.174 0 .322.11.446.327l1.454 2.57c.19.337.24.478.024.837-.26.43-.513.864-.76 1.3l-.367.658c-.106.196-.223.28-.04.512l2.652 4.637c.172.301.111.494-.043.77-.437.785-.882 1.564-1.335 2.34-.159.272-.352.375-.68.37-.777-.016-1.552-.01-2.327.016a.099.099 0 00-.081.05 575.097 575.097 0 01-2.705 4.74c-.169.293-.38.363-.725.364-.997.003-2.002.004-3.017.002a.537.537 0 01-.465-.271l-1.335-2.323a.09.09 0 00-.083-.049H4.982c-.285.03-.553-.001-.805-.092l-1.603-2.77a.543.543 0 01-.002-.54l1.207-2.12a.198.198 0 000-.197 550.951 550.951 0 01-1.875-3.272l-.79-1.395c-.16-.31-.173-.496.095-.965.465-.813.927-1.625 1.387-2.436.132-.234.304-.334.584-.335a338.3 338.3 0 012.589-.001.124.124 0 00.107-.063l2.806-4.895a.488.488 0 01.422-.246c.524-.001 1.053 0 1.583-.006L11.704 1c.341-.003.724.032.9.34zm-3.432.403a.06.06 0 00-.052.03L6.254 6.788a.157.157 0 01-.135.078H3.253c-.056 0-.07.025-.041.074l5.81 10.156c.025.042.013.062-.034.063l-2.795.015a.218.218 0 00-.2.116l-1.32 2.31c-.044.078-.021.118.068.118l5.716.008c.046 0 .08.02.104.061l1.403 2.454c.046.081.092.082.139 0l5.006-8.76.783-1.382a.055.055 0 01.096 0l1.424 2.53a.122.122 0 00.107.062l2.763-.02a.04.04 0 00.035-.02.041.041 0 000-.04l-2.9-5.086a.108.108 0 010-.113l.293-.507 1.12-1.977c.024-.041.012-.062-.035-.062H9.2c-.059 0-.073-.026-.043-.077l1.434-2.505a.107.107 0 000-.114L9.225 1.774a.06.06 0 00-.053-.031zm6.29 8.02c.046 0 .058.02.034.06l-.832 1.465-2.613 4.585a.056.056 0 01-.05.029.058.058 0 01-.05-.029L8.498 9.841c-.02-.034-.01-.052.028-.054l.216-.012 6.722-.012z"></path></svg>`;

const llamaLogo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 171"><defs><linearGradient id="meta-a" x1="13.878%" x2="89.144%" y1="55.934%" y2="58.694%"><stop offset="0%" stop-color="#0064E1"/><stop offset="40%" stop-color="#0064E1"/><stop offset="83%" stop-color="#0073EE"/><stop offset="100%" stop-color="#0082FB"/></linearGradient><linearGradient id="meta-b" x1="54.315%" x2="54.315%" y1="82.782%" y2="39.307%"><stop offset="0%" stop-color="#0082FB"/><stop offset="100%" stop-color="#0064E0"/></linearGradient></defs><path fill="#0081FB" d="M27.651 112.136c0 9.775 2.146 17.28 4.95 21.82 3.677 5.947 9.16 8.466 14.751 8.466 7.211 0 13.808-1.79 26.52-19.372 10.185-14.092 22.186-33.874 30.26-46.275l13.675-21.01c9.499-14.591 20.493-30.811 33.1-41.806C161.196 4.985 172.298 0 183.47 0c18.758 0 36.625 10.87 50.3 31.257C248.735 53.584 256 81.707 256 110.729c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363v-27.616c15.695 0 19.612-14.422 19.612-30.927 0-23.52-5.484-49.623-17.564-68.273-8.574-13.23-19.684-21.313-31.907-21.313-13.22 0-23.859 9.97-35.815 27.75-6.356 9.445-12.882 20.956-20.208 33.944l-8.066 14.289c-16.203 28.728-20.307 35.271-28.408 46.07-14.2 18.91-26.324 26.076-42.287 26.076-18.935 0-30.91-8.2-38.325-20.556C2.973 139.413 0 126.202 0 111.148l27.651.988Z"/><path fill="url(#meta-a)" d="M21.802 33.206C34.48 13.666 52.774 0 73.757 0 85.91 0 97.99 3.597 110.605 13.897c13.798 11.261 28.505 29.805 46.853 60.368l6.58 10.967c15.881 26.459 24.917 40.07 30.205 46.49 6.802 8.243 11.565 10.7 17.752 10.7 15.695 0 19.612-14.422 19.612-30.927l24.393-.766c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363-11.395 0-21.49-2.475-32.654-13.007-8.582-8.083-18.615-22.443-26.334-35.352l-22.96-38.352C118.528 64.08 107.96 49.73 101.845 43.23c-6.578-6.988-15.036-15.428-28.532-15.428-10.923 0-20.2 7.666-27.963 19.39L21.802 33.206Z"/><path fill="url(#meta-b)" d="M73.312 27.802c-10.923 0-20.2 7.666-27.963 19.39-10.976 16.568-17.698 41.245-17.698 64.944 0 9.775 2.146 17.28 4.95 21.82L9.027 149.482C2.973 139.413 0 126.202 0 111.148 0 83.772 7.514 55.24 21.802 33.206 34.48 13.666 52.774 0 73.757 0l-.445 27.802Z"/></svg>`;

const devstralLogo = `<svg width="365" height="258" viewBox="0 0 365 258" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M104.107 0H52.0525V51.57H104.107V0Z" fill="#FFD800"/><path d="M312.351 0H260.296V51.57H312.351V0Z" fill="#FFD800"/><path d="M156.161 51.5701L52.0525 51.57V103.14H156.161V51.5701Z" fill="#FFAF00"/><path d="M312.353 51.5701H208.244V103.14H312.353V51.5701Z" fill="#FFAF00"/><path d="M312.356 103.14H52.0525V154.71H312.356V103.14Z" fill="#FF8205"/><path d="M104.107 154.71H52.0525V206.28H104.107V154.71Z" fill="#FA500F"/><path d="M208.228 154.711H156.174V206.281H208.228V154.711Z" fill="#FA500F"/><path d="M312.351 154.711H260.296V206.281H312.351V154.711Z" fill="#FA500F"/><path d="M156.195 206.312H0V257.882H156.195V206.312Z" fill="#E10500"/><path d="M364.439 206.312H208.244V257.882H364.439V206.312Z" fill="#E10500"/></svg>`;

const grokLogo = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2_5)"><path d="M6.17937 9.90356L11.4986 5.95477C11.7594 5.76117 12.1321 5.83669 12.2564 6.13737C12.9103 7.7232 12.6182 9.62895 11.317 10.9374C10.0159 12.2459 8.20549 12.5329 6.55074 11.8793L4.74307 12.721C7.33579 14.5032 10.4842 14.0624 12.4516 12.0825C14.0121 10.5132 14.4954 8.37402 14.0435 6.44494L14.0476 6.44905C13.3923 3.61516 14.2087 2.48241 15.8813 0.166134C15.9208 0.111214 15.9605 0.0562936 16 0L13.7991 2.2133V2.20644L6.17801 9.90494" fill="white"/><path d="M5.08166 10.8633C3.22075 9.07564 3.54159 6.30901 5.12945 4.71357C6.30361 3.53278 8.22733 3.05086 9.90666 3.75932L11.7102 2.92179C11.3853 2.68564 10.9689 2.43162 10.491 2.25314C8.33109 1.3593 5.7452 1.80415 3.98942 3.56848C2.30053 5.2669 1.76944 7.87837 2.68145 10.1068C3.36275 11.7722 2.24592 12.9503 1.12091 14.1393C0.722245 14.5608 0.322212 14.9824 0 15.4286L5.0803 10.8647" fill="white"/></g><defs><clipPath id="clip0_2_5"><rect width="16" height="16" fill="white"/></clipPath></defs></svg>`;

const glmLogo = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.74749 16C7.19799 16 5.84218 15.6706 4.68006 15.0117C3.51793 14.3528 2.61406 13.427 1.96844 12.2341C1.32281 11.0342 1 9.62635 1 8.0104C1 6.3251 1.33716 4.886 2.01148 3.69311C2.6858 2.49328 3.60043 1.57781 4.75538 0.946684C5.9175 0.315561 7.22669 0 8.68293 0C9.94548 0 11.0968 0.232336 12.137 0.697009C13.1844 1.15475 14.0416 1.79627 14.7088 2.62159C15.3759 3.4469 15.7669 4.41092 15.8816 5.51365H11.9433C11.7999 4.82705 11.4591 4.28262 10.9211 3.88036C10.3902 3.47117 9.69082 3.26658 8.82281 3.26658C7.57461 3.26658 6.60617 3.68617 5.9175 4.52536C5.23601 5.35761 4.89527 6.51929 4.89527 8.0104C4.89527 9.50152 5.2396 10.6632 5.92826 11.4954C6.6241 12.3208 7.6033 12.7334 8.86585 12.7334C9.88451 12.7334 10.6915 12.4872 11.2869 11.9948C11.8895 11.5024 12.198 10.8574 12.2123 10.0598H9.00574V7.31339H16V9.41482C16 10.7256 15.6915 11.8769 15.0746 12.8687C14.4648 13.8535 13.6148 14.6233 12.5244 15.1782C11.434 15.7261 10.175 16 8.74749 16Z" fill="#07A9C8"/></svg>`;

function escapeSvgText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function RankBadge({ rank }: { rank: number }) {
  const baseClass =
    "inline-flex h-6 min-w-6 items-center justify-center border px-1.5 text-xs font-semibold";

  if (rank === 1) {
    return <span className={`${baseClass} border-amber-400/50 bg-amber-400/20 text-amber-100`}>1</span>;
  }

  if (rank === 2) {
    return <span className={`${baseClass} border-slate-300/45 bg-slate-300/20 text-slate-100`}>2</span>;
  }

  if (rank === 3) {
    return <span className={`${baseClass} border-orange-500/50 bg-orange-500/20 text-orange-100`}>3</span>;
  }

  return <span className={`${baseClass} border-zinc-700 text-zinc-300`}>{rank}</span>;
}

export function DeltaBadge({ value }: { value: number }) {
  const positive = value >= 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border border-transparent px-2 py-1 text-xs font-medium",
        positive ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300",
      )}
    >
      {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {positive ? "+" : ""}
      {formatPct(value)}
    </span>
  );
}

function ModelLogoMarkup({
  svg,
  className,
}: {
  svg: string;
  className?: string;
}) {
  const sizedSvg = getSizedLogoSvg(svg, className);

  return (
    <span
      className={cn(
        "inline-flex h-4 w-4 items-center justify-center [&>svg]:block [&>svg]:h-4 [&>svg]:w-4",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: sizedSvg }}
      aria-hidden
    />
  );
}

function getSizedLogoSvg(svg: string, className?: string): string {
  const colorized = className?.includes("text-zinc-100")
    ? svg.replace(/currentColor/g, "#f4f4f5")
    : svg;

  return colorized.replace(
    /<svg\b([^>]*)>/i,
    (_match, attrs) =>
      `<svg width="16" height="16"${String(attrs)
        .replace(/\swidth="[^"]*"/i, "")
        .replace(/\sheight="[^"]*"/i, "")}>`,
  );
}

function modelLogoById(modelId: string): { svg: string; className?: string } | null {
  const normalizedId = modelId.toLowerCase();

  if (modelId.startsWith("claude-")) {
    return { svg: anthropicLogo, className: "text-zinc-100" };
  }

  if (modelId.startsWith("gpt-")) {
    return { svg: gptLogo };
  }

  if (normalizedId.startsWith("gemini-")) {
    return { svg: geminiLogo };
  }

  if (normalizedId.startsWith("grok-")) {
    return { svg: grokLogo };
  }

  if (normalizedId.startsWith("glm-")) {
    return { svg: glmLogo };
  }

  if (normalizedId.startsWith("deepseek-")) {
    return { svg: deepseekLogo };
  }

  if (normalizedId.startsWith("kimi-")) {
    return { svg: kimiLogo };
  }

  if (modelId === "qwen-3-coder") {
    return { svg: qwenLogo, className: "text-zinc-100" };
  }

  if (normalizedId.includes("qwen")) {
    return { svg: qwenLogo, className: "text-zinc-100" };
  }

  if (normalizedId.includes("llama")) {
    return { svg: llamaLogo };
  }

  if (normalizedId.includes("devstral")) {
    return { svg: devstralLogo };
  }

  if (modelId === "llama-4-maverick") {
    return { svg: llamaLogo };
  }

  return null;
}

export function getModelLogoDataUri(modelId: string, modelLabel: string): string {
  const logo = modelLogoById(modelId);

  if (logo) {
    const sizedSvg = getSizedLogoSvg(logo.svg, logo.className);
    return `data:image/svg+xml;utf8,${encodeURIComponent(sizedSvg)}`;
  }

  const fallback = modelLabel
    .split(" ")
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const fallbackSvg = `<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><rect width="16" height="16" fill="#18181b"/><text x="8" y="11" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" fill="#d4d4d8">${escapeSvgText(fallback)}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(fallbackSvg)}`;
}

export function ModelLogoSquare({ modelId, modelLabel }: { modelId: string; modelLabel: string }) {
  const fallback = modelLabel
    .split(" ")
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const logo = modelLogoById(modelId);

  return (
    <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
      {logo ? (
        <ModelLogoMarkup svg={logo.svg} className={logo.className} />
      ) : (
        <span className="text-[10px] font-semibold uppercase leading-none text-zinc-300">{fallback}</span>
      )}
    </span>
  );
}

function rankRgb(rank: number): string | null {
  if (rank === 1) {
    return "251, 191, 36";
  }

  if (rank === 2) {
    return "203, 213, 225";
  }

  if (rank === 3) {
    return "249, 115, 22";
  }

  return null;
}

export function getPodiumRowStyle(rank: number): CSSProperties | undefined {
  const rgb = rankRgb(rank);

  if (!rgb) {
    return undefined;
  }

  return {
    borderLeft: `2px solid rgb(${rgb})`,
    backgroundImage: `linear-gradient(90deg, rgba(${rgb}, 0.10) 0%, rgba(${rgb}, 0) 40%)`,
    backgroundBlendMode: "screen",
  };
}
