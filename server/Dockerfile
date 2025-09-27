# Stage 1: Build Stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Restore
COPY ["server/server.csproj", "server/"]
RUN dotnet restore "server/server.csproj"

# Build
COPY ["server", "server/"]
WORKDIR /src/server
RUN dotnet build "server.csproj" -c Release -o /app/build

# Stage 2: Publish Stage
FROM build AS publish
RUN dotnet publish "server.csproj" -c Release -o /app/publish

# Stage 3: Run Stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0
ENV ASPNETCORE_HTTP_PORTS=2908
EXPOSE 2908
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "server.dll"]