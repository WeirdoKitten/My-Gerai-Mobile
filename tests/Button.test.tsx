import { fireEvent, render, screen } from "@testing-library/react-native";

import { Button } from "@/components/ui";

describe("Button", () => {
  it("memanggil onPress saat ditekan", async () => {
    const onPress = jest.fn();
    await render(<Button label="Tandai Diproses" onPress={onPress} />);
    await fireEvent.press(screen.getByRole("button", { name: "Tandai Diproses" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("tidak bisa ditekan saat loading", async () => {
    const onPress = jest.fn();
    await render(<Button label="Menyimpan" loading onPress={onPress} />);
    const button = screen.getByRole("button", { name: "Menyimpan" });
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
    expect(button).toBeBusy();
  });
});
