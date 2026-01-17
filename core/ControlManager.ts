// ==========================================
// CONTROL SYSTEM - STRATEGY PATTERN
// ==========================================

export enum InputAction {
    UP = 'UP',
    DOWN = 'DOWN',
    LEFT = 'LEFT',
    RIGHT = 'RIGHT',
    ACTION_A = 'ACTION_A',
    ACTION_B = 'ACTION_B',
    ACTION_X = 'ACTION_X',
    ACTION_Y = 'ACTION_Y',
    START = 'START',
    SELECT = 'SELECT',
    PAUSE = 'PAUSE'
}

export interface InputState {
    action: InputAction;
    pressed: boolean;
    timestamp: number;
}

export interface InputStrategy {
    initialize(): void;
    cleanup(): void;
    getState(): InputState[];
    vibrate?(intensity: number, duration: number): void;
}

// ==========================================
// KEYBOARD STRATEGY
// ==========================================
export class KeyboardStrategy implements InputStrategy {
    private keyMap: Map<string, InputAction> = new Map([
        ['ArrowUp', InputAction.UP],
        ['ArrowDown', InputAction.DOWN],
        ['ArrowLeft', InputAction.LEFT],
        ['ArrowRight', InputAction.RIGHT],
        ['w', InputAction.UP],
        ['s', InputAction.DOWN],
        ['a', InputAction.LEFT],
        ['d', InputAction.RIGHT],
        [' ', InputAction.ACTION_A],
        ['Enter', InputAction.START],
        ['Escape', InputAction.PAUSE],
        ['z', InputAction.ACTION_A],
        ['x', InputAction.ACTION_B],
        ['c', InputAction.ACTION_X],
        ['v', InputAction.ACTION_Y]
    ]);

    private pressedKeys: Set<string> = new Set();
    private handleKeyDown = (e: KeyboardEvent) => {
        this.pressedKeys.add(e.key);
    };
    private handleKeyUp = (e: KeyboardEvent) => {
        this.pressedKeys.delete(e.key);
    };

    initialize(): void {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    cleanup(): void {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
    }

    getState(): InputState[] {
        const states: InputState[] = [];
        const now = Date.now();

        this.pressedKeys.forEach(key => {
            const action = this.keyMap.get(key);
            if (action) {
                states.push({ action, pressed: true, timestamp: now });
            }
        });

        return states;
    }
}

// ==========================================
// GAMEPAD STRATEGY
// ==========================================
export class GamepadStrategy implements InputStrategy {
    private gamepadIndex: number | null = null;
    private buttonMap: Map<number, InputAction> = new Map([
        [0, InputAction.ACTION_A],     // A / Cross
        [1, InputAction.ACTION_B],     // B / Circle
        [2, InputAction.ACTION_X],     // X / Square
        [3, InputAction.ACTION_Y],     // Y / Triangle
        [9, InputAction.START],        // Start
        [8, InputAction.SELECT],       // Select
        [12, InputAction.UP],          // D-pad Up
        [13, InputAction.DOWN],        // D-pad Down
        [14, InputAction.LEFT],        // D-pad Left
        [15, InputAction.RIGHT]        // D-pad Right
    ]);

    initialize(): void {
        window.addEventListener('gamepadconnected', (e: any) => {
            this.gamepadIndex = e.gamepad.index;
            console.log('🎮 Gamepad connected:', e.gamepad.id);
        });

        window.addEventListener('gamepaddisconnected', () => {
            this.gamepadIndex = null;
            console.log('🎮 Gamepad disconnected');
        });
    }

    cleanup(): void {
        this.gamepadIndex = null;
    }

    getState(): InputState[] {
        if (this.gamepadIndex === null) return [];

        const gamepads = navigator.getGamepads();
        const gamepad = gamepads[this.gamepadIndex];
        if (!gamepad) return [];

        const states: InputState[] = [];
        const now = Date.now();

        // Buttons
        gamepad.buttons.forEach((button, index) => {
            const action = this.buttonMap.get(index);
            if (action && button.pressed) {
                states.push({ action, pressed: true, timestamp: now });
            }
        });

        // Analog sticks
        const deadzone = 0.2;
        if (gamepad.axes[0] < -deadzone) {
            states.push({ action: InputAction.LEFT, pressed: true, timestamp: now });
        } else if (gamepad.axes[0] > deadzone) {
            states.push({ action: InputAction.RIGHT, pressed: true, timestamp: now });
        }
        if (gamepad.axes[1] < -deadzone) {
            states.push({ action: InputAction.UP, pressed: true, timestamp: now });
        } else if (gamepad.axes[1] > deadzone) {
            states.push({ action: InputAction.DOWN, pressed: true, timestamp: now });
        }

        return states;
    }

    vibrate(intensity: number, duration: number): void {
        if (this.gamepadIndex === null) return;
        const gamepads = navigator.getGamepads();
        const gamepad = gamepads[this.gamepadIndex] as any;

        if (gamepad?.vibrationActuator) {
            gamepad.vibrationActuator.playEffect('dual-rumble', {
                startDelay: 0,
                duration,
                weakMagnitude: intensity,
                strongMagnitude: intensity
            });
        }
    }
}

// ==========================================
// TOUCH STRATEGY
// ==========================================
export class TouchStrategy implements InputStrategy {
    private touchState: Map<InputAction, boolean> = new Map();
    private virtualButtons: HTMLElement[] = [];

    initialize(): void {
        // Create virtual D-pad and buttons for mobile
        this.createVirtualControls();
    }

    cleanup(): void {
        this.virtualButtons.forEach(btn => btn.remove());
        this.virtualButtons = [];
    }

    getState(): InputState[] {
        const states: InputState[] = [];
        const now = Date.now();

        this.touchState.forEach((pressed, action) => {
            if (pressed) {
                states.push({ action, pressed: true, timestamp: now });
            }
        });

        return states;
    }

    private createVirtualControls(): void {
        // This would create on-screen touch controls for mobile
        // Implementation depends on UI framework
    }

    private handleTouch(action: InputAction, pressed: boolean): void {
        this.touchState.set(action, pressed);
    }
}

// ==========================================
// CONTROL MANAGER
// ==========================================
export class ControlManager {
    private strategies: InputStrategy[] = [];
    private activeStrategy: InputStrategy | null = null;
    private isInitialized = false;

    constructor() {
        this.detectAndSetupStrategies();
    }

    private detectAndSetupStrategies(): void {
        // Keyboard is always available
        this.strategies.push(new KeyboardStrategy());

        // Check for gamepad support
        if ('getGamepads' in navigator) {
            this.strategies.push(new GamepadStrategy());
        }

        // Check for touch support
        if ('ontouchstart' in window) {
            this.strategies.push(new TouchStrategy());
        }
    }

    initialize(): void {
        if (this.isInitialized) return;

        this.strategies.forEach(strategy => strategy.initialize());
        this.activeStrategy = this.strategies[0]; // Default to keyboard
        this.isInitialized = true;
    }

    cleanup(): void {
        this.strategies.forEach(strategy => strategy.cleanup());
        this.isInitialized = false;
    }

    getInput(): InputState[] {
        const allStates: InputState[] = [];

        // Collect input from all active strategies
        this.strategies.forEach(strategy => {
            allStates.push(...strategy.getState());
        });

        return allStates;
    }

    isActionPressed(action: InputAction): boolean {
        return this.getInput().some(state => state.action === action && state.pressed);
    }

    vibrate(intensity: number = 0.5, duration: number = 200): void {
        this.strategies.forEach(strategy => {
            if (strategy.vibrate) {
                strategy.vibrate(intensity, duration);
            }
        });
    }
}
