def pyramid(n):
    for i in range(0, n):
        for j in range(n - i):
           print(" ", end="")
        for k in range(0,i+1):
            print("*", end="")
        print()
pyramid(3)